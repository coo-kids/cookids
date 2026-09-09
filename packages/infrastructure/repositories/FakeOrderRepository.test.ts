import { describe, expect, it } from "vitest";
import { FakeOrderRepository } from "./FakeOrderRepository.js";
import type { Order } from "@cookids/domain/models/Order.js";

describe("FakeOrderRepository", () => {
  it("conserve les commandes sauvegardées", async () => {
    const repository = new FakeOrderRepository();
    const order: Order = {
      id: 42,
      createdAt: new Date(),
      customer: { firstName: "Camille", email: "camille@example.com" },
      deliveryLocation: "rosa-parks",
      items: [],
      total: 0,
      status: "new"
    };

    await repository.save(order);

    expect(repository.savedOrders).toEqual([order]);
  });
});
