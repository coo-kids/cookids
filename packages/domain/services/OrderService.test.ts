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
        { id: "boxed-favorites", label: "Les favoris en boîte", quantityMultiple: undefined },
        { id: "custom-cookies", label: "Cookies sur mesure", quantityMultiple: undefined },
        { id: "financiers", label: "Financiers", quantityMultiple: undefined },
      ],
      products: [
      {
        id: "custom-cookie-box",
        name: "Ma boîte personnalisée",
        description: "",
        ingredients: [],
        price: 1.5,
        image: "/images/cookie-chocolat.jpg",
        category: "custom-cookies",
        unitLabel: "1 cookie",
        quantityMultiple: 12,
        minimumToppings: 1,
        maximumToppings: 3,
        availableToppings: [
          { id: "chocolat-noir", label: "Chocolat noir", is_allergen: false },
          { id: "noisettes", label: "Noisettes", is_allergen: true },
          { id: "cafe", label: "Café", is_allergen: false },
          { id: "coco", label: "Coco", is_allergen: true },
        ],
      },
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
        id: "cookie-triple-noisette",
        name: "Cookie triple noisette",
        description: "",
        ingredients: [],
        price: 1,
        image: "/images/cookie-triple-noisette.jpg",
        category: "boxed-favorites",
        unitLabel: "1 cookie",
        quantityMultiple: 15,
      },
      {
        id: "financiers-amandes",
        name: "Financiers aux amandes",
        description: "",
        ingredients: [],
        price: 0.5,
        image: "/images/financiers-amandes.jpg",
        category: "financiers",
        unitLabel: "1 financier",
        quantityMultiple: 10,
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
  items?: Array<{ productId: string; quantity: number; toppingIds?: string[] }>;
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
      { productId: "financiers-amandes", quantity: 10 }
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

  it("impose le conditionnement par 10 des financiers", async () => {
    const { service } = await createFixture();

    await expect(
      service.create(createOrderInput({ items: [{ productId: "financiers-amandes", quantity: 1 }] })),
    ).rejects.toThrow("multiple de 10");

    const order = await service.create(
      createOrderInput({ items: [{ productId: "financiers-amandes", quantity: 10 }] }),
    );

    expect(order.total).toBe(5);
  });

  it("impose le conditionnement défini sur un favori", async () => {
    const { service } = await createFixture();

    await expect(
      service.create(createOrderInput({ items: [{ productId: "cookie-triple-noisette", quantity: 14 }] })),
    ).rejects.toThrow("multiple de 15");

    const order = await service.create(
      createOrderInput({ items: [{ productId: "cookie-triple-noisette", quantity: 15 }] }),
    );
    expect(order.total).toBe(15);
  });

  it("valide une boîte personnalisée et résout les noms de toppings", async () => {
    const { service } = await createFixture();
    const order = await service.create(createOrderInput({ items: [{
      productId: "custom-cookie-box",
      quantity: 12,
      toppingIds: ["chocolat-noir", "cafe"],
    }] }));

    expect(order.total).toBe(18);
    expect(order.items[0]?.toppingLabels).toEqual(["Chocolat noir", "Café"]);
  });

  it.each([
    { toppingIds: [], label: "aucun topping" },
    { toppingIds: ["chocolat-noir", "noisettes", "cafe", "coco"], label: "plus de trois toppings" },
    { toppingIds: ["inconnu"], label: "un topping inconnu" },
    { toppingIds: ["cafe", "cafe"], label: "un topping en double" },
  ])("rejette $label", async ({ toppingIds }) => {
    const { service } = await createFixture();
    await expect(service.create(createOrderInput({ items: [{
      productId: "custom-cookie-box",
      quantity: 12,
      toppingIds,
    }] }))).rejects.toThrow("entre 1 et 3 toppings autorisés");
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
