import "reflect-metadata";
import { afterEach, describe, expect, it } from "vitest";
import { DITest } from "@tsed/di";
import { deserialize } from "@tsed/json-mapper";
import { CatalogProvider } from "../catalog/CatalogProvider.js";
import { DeliveryLocationProvider } from "../content/DeliveryLocationProvider.js";
import { MailService } from "../mail/MailService.js";
import type { ContentCatalog } from "../schemas/ContentCatalogSchema.js";
import { Order } from "../models/Order.js";
import { OrderRepository } from "../repositories/OrderRepository.js";
import { OrderService } from "./OrderService.js";

class TestOrderRepository extends OrderRepository {
  readonly orders: Order[] = [];
  shouldFail = false;

  async save(order: Order): Promise<{ id: number }> {
    if (this.shouldFail) throw new Error("repository failed");
    this.orders.push(order);
    return { id: 42 };
  }
}

class TestMailService extends MailService {
  readonly orders: Order[] = [];
  shouldFail = false;

  async sendOrderConfirmation(order: Order): Promise<void> {
    if (this.shouldFail) throw new Error("mail failed");
    this.orders.push(order);
  }
}

class TestCatalogProvider extends CatalogProvider {
  async getCatalog(): Promise<ContentCatalog> {
    return {
      categories: [
        { id: "cookies", label: "Cookies", quantityMultiple: 12 },
        { id: "financiers", label: "Financiers", quantityMultiple: undefined },
      ],
      products: [
      {
        id: "cookie-cafe-noix",
        name: "Cookie café & noix",
        description: "",
        ingredients: [],
        price: 1,
        image: "/images/cookie-cafe-noix.jpg",
        category: "cookies",
        unitLabel: "1 unité",
      },
      {
        id: "cookie-chocolat-noir",
        name: "Cookie au chocolat noir",
        description: "",
        ingredients: [],
        price: 1,
        image: "/images/cookie-chocolat-noir.jpg",
        category: "cookies",
        unitLabel: "1 unité",
      },
      {
        id: "financiers-amandes",
        name: "Financiers aux amandes",
        description: "",
        ingredients: [],
        price: 5,
        image: "/images/financiers-amandes.jpg",
        category: "financiers",
        unitLabel: "le lot de 10",
      },
    ],
    };
  }
}

let fixedDeliveryDates: string[] = [];

class TestDeliveryLocationProvider extends DeliveryLocationProvider {
  async getDeliveryLocations() {
    return [{ id: "rosa-parks", label: "Rosa Parks", fixedDeliveryDates }];
  }
}

async function createFixture(): Promise<{
  service: OrderService;
  repository: TestOrderRepository;
  mailService: TestMailService;
}> {
  const repository = new TestOrderRepository();
  const mailService = new TestMailService();
  const service = await DITest.invoke(OrderService, [
    { token: OrderRepository, use: repository },
    { token: MailService, use: mailService },
    { token: CatalogProvider, use: new TestCatalogProvider() },
    { token: DeliveryLocationProvider, use: new TestDeliveryLocationProvider() },
  ]);
  return { service, repository, mailService };
}

function createOrderInput(overrides: {
  items?: Array<{ productId: string; quantity: number }>;
  targetDeliveryDate?: Date;
} = {}): Order {
  return deserialize<Order>({
    customer: {
      firstName: "Camille",
      lastName: "Dupont",
      email: "camille@example.com",
      phoneNumber: "0600000000"
    },
    deliveryLocation: "rosa-parks",
    items: overrides.items ?? [
      { productId: "cookie-cafe-noix", quantity: 12 },
      { productId: "financiers-amandes", quantity: 1 }
    ],
    targetDeliveryDate: overrides.targetDeliveryDate
  }, { type: Order, groups: ["create"], strictGroups: true, useAlias: false });
}

const validOrder = createOrderInput();

describe("OrderService", () => {
  afterEach(() => { DITest.reset(); fixedDeliveryDates = []; });

  it("crée une commande normalisée et recalcule son total", async () => {
    const { service, repository, mailService } = await createFixture();
    const order = await service.create(validOrder);

    expect(order.total).toBe(17);
    expect(order.id).toBe(42);
    expect(order.items).toHaveLength(2);
    expect(repository.orders).toHaveLength(1);
    expect(mailService.orders).toHaveLength(1);
  });

  it("rejette un produit inexistant", async () => {
    const { service } = await createFixture();
    await expect(
      service.create(createOrderInput({ items: [{ productId: "inconnu", quantity: 1 }] })),
    ).rejects.toThrow("n'existe pas");
  });

  it("rejette une quantité qui ne respecte pas le multiple de sa catégorie", async () => {
    const { service } = await createFixture();

    await expect(
      service.create(createOrderInput({ items: [{ productId: "cookie-cafe-noix", quantity: 11 }] })),
    ).rejects.toThrow("multiple de 12");
  });

  it("additionne les variétés d'une même catégorie pour appliquer son multiple", async () => {
    const { service } = await createFixture();

    const order = await service.create(
      createOrderInput({
        items: [
          { productId: "cookie-cafe-noix", quantity: 5 },
          { productId: "cookie-chocolat-noir", quantity: 7 },
        ],
      }),
    );

    expect(order.total).toBe(12);
  });

  it("accepte librement une catégorie sans règle de composition", async () => {
    const { service } = await createFixture();

    const order = await service.create(
      createOrderInput({ items: [{ productId: "financiers-amandes", quantity: 1 }] }),
    );

    expect(order.total).toBe(5);
  });

  it("rejette une date absente lorsqu'un lieu impose des dates fixes", async () => {
    fixedDeliveryDates = ["2026-09-19"];
    const { service } = await createFixture();
    await expect(service.create(validOrder)).rejects.toThrow("La date de livraison n'est pas disponible pour ce lieu.");
  });

  it("accepte une date fixe autorisée", async () => {
    fixedDeliveryDates = ["2026-09-19"];
    const { service } = await createFixture();
    const order = await service.create(createOrderInput({ targetDeliveryDate: new Date("2026-09-19T00:00:00.000Z") }));
    expect(order.targetDeliveryDate?.toISOString()).toBe("2026-09-19T00:00:00.000Z");
  });

  it("rejette une date fixe non autorisée", async () => {
    fixedDeliveryDates = ["2026-09-19"];
    const { service } = await createFixture();
    await expect(service.create(createOrderInput({ targetDeliveryDate: new Date("2026-09-20T00:00:00.000Z") }))).rejects.toThrow("La date de livraison n'est pas disponible pour ce lieu.");
  });

  it("propage les défaillances du repository", async () => {
    const repositoryFailure = await createFixture();
    repositoryFailure.repository.shouldFail = true;
    await expect(repositoryFailure.service.create(validOrder)).rejects.toThrow(
      "repository failed",
    );

  });

  it("conserve la commande lorsque l'email de confirmation échoue", async () => {
    const mailFailure = await createFixture();
    mailFailure.mailService.shouldFail = true;

    const order = await mailFailure.service.create(createOrderInput());

    expect(order.id).toBe(42);
    expect(mailFailure.repository.orders).toHaveLength(1);
    expect(mailFailure.mailService.orders).toHaveLength(0);
  });
});
