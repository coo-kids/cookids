import { describe, expect, it } from "vitest";
import type { Order } from "@cookids/domain";
import { FakeOrderRepository } from "./FakeOrderRepository.js";

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
