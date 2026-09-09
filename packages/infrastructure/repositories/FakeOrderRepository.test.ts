import { describe, expect, it } from "vitest";
import type { Order } from "@cookids/domain";
import { FakeOrderRepository } from "./FakeOrderRepository.js";

describe("FakeOrderRepository", () => {
  it("conserve les commandes sauvegardées", async () => {
    const repository = new FakeOrderRepository();
    const order = { id: "CK-20260909-ABCD" } as Order;

    await repository.save(order);

    expect(repository.savedOrders).toEqual([order]);
  });
});
