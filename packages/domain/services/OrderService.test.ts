import "reflect-metadata";
import "@tsed/ajv";
import { AjvService } from "@tsed/ajv";
import { afterEach, describe, expect, it } from "vitest";
import { DITest } from "@tsed/di";
import { CatalogProvider } from "../catalog/CatalogProvider.js";
import { MailService } from "../mail/MailService.js";
import type { Product } from "../models/Product.js";
import type { Order } from "../models/Order.js";
import { OrderRepository } from "../repositories/OrderRepository.js";
import { OrderService } from "./OrderService.js";

class TestOrderRepository extends OrderRepository {
  readonly orders: Order[] = [];
  shouldFail = false;

  async save(order: Order): Promise<void> {
    if (this.shouldFail) throw new Error("repository failed");
    this.orders.push(order);
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
        price: 100,
        image: "/images/cookie-cafe-noix.jpg",
        category: "cookies",
        unitLabel: "à l'unité",
      },
      {
        id: "financiers-amandes",
        name: "Financiers aux amandes",
        description: "",
        ingredients: [],
        price: 500,
        image: "/images/financiers-amandes.jpg",
        category: "other",
        unitLabel: "le lot de 10",
      },
    ];
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
    { token: AjvService, use: new AjvService() },
    { token: CatalogProvider, use: new TestCatalogProvider() },
  ]);
  return { service, repository, mailService };
}

const validOrder = {
  firstName: "Camille",
  lastName: "Dupont",
  email: "camille@example.com",
  phoneNumber: "0600000000",
  deliveryLocation: "rosa-parks",
  items: [{ productId: "cookie-cafe-noix", quantity: 2 }, { productId: "financiers-amandes", quantity: 1 }]
};

describe("OrderService", () => {
  afterEach(() => DITest.reset());

  it("crée une commande normalisée et recalcule son total", async () => {
    const { service, repository, mailService } = await createFixture();
    const order = await service.create(validOrder);

    expect(order.totalPrice).toBe(7);
    expect(order.id).toMatch(/^CK-\d{8}-[A-F0-9]{4}$/);
    expect(order.items).toHaveLength(2);
    expect(repository.orders).toHaveLength(1);
    expect(mailService.orders).toHaveLength(1);
  });

  it.each([
    [{ ...validOrder, items: [] }],
    [{ ...validOrder, email: "not-an-email" }],
    [
      {
        ...validOrder,
        items: [{ productId: "cookie-cafe-noix", quantity: 0 }],
      },
    ],
    [
      {
        ...validOrder,
        items: [{ productId: "cookie-cafe-noix", quantity: -1 }],
      },
    ],
    [
      {
        ...validOrder,
        items: [{ productId: "cookie-cafe-noix", quantity: 49 }],
      },
    ],
  ])("rejette une commande invalide", async (input: unknown) => {
    const { service } = await createFixture();
    await expect(service.create(input)).rejects.toThrow(
      "La commande n'est pas valide.",
    );
  });

  it("rejette un produit inexistant", async () => {
    const { service } = await createFixture();
    await expect(
      service.create({
        ...validOrder,
        items: [{ productId: "inconnu", quantity: 1 }],
      }),
    ).rejects.toThrow("n'existe pas");
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
