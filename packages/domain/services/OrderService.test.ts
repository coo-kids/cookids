import "reflect-metadata";
import { afterEach, describe, expect, it } from "vitest";
import { DITest } from "@tsed/di";
import { deserialize } from "@tsed/json-mapper";
import { CatalogProvider } from "../catalog/CatalogProvider.js";
import { DeliveryLocationProvider } from "../content/DeliveryLocationProvider.js";
import { MailService } from "../mail/MailService.js";
import type { Product } from "../models/Product.js";
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
  async getProducts(): Promise<Product[]> {
    return [
      {
        id: "cookie-cafe-noix",
        name: "Cookie café & noix",
        description: "",
        ingredients: [],
        price: 1,
        image: "/images/cookie-cafe-noix.jpg",
        category: "cookies",
        unitLabel: "à l'unité",
      },
      {
        id: "financiers-amandes",
        name: "Financiers aux amandes",
        description: "",
        ingredients: [],
        price: 5,
        image: "/images/financiers-amandes.jpg",
        category: "other",
        unitLabel: "le lot de 10",
      },
    ];
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
      { productId: "cookie-cafe-noix", quantity: 2 },
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

    expect(order.total).toBe(7);
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

  it("propage les défaillances du repository et du mail", async () => {
    const repositoryFailure = await createFixture();
    repositoryFailure.repository.shouldFail = true;
    await expect(repositoryFailure.service.create(validOrder)).rejects.toThrow(
      "repository failed",
    );

    const mailFailure = await createFixture();
    mailFailure.mailService.shouldFail = true;
    await expect(mailFailure.service.create(validOrder)).rejects.toThrow(
      "mail failed",
    );
  });
});
