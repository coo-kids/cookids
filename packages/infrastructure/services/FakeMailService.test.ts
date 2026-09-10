import { describe, expect, it } from "vitest";
import { FakeMailService } from "./FakeMailService.js";
import type { Order } from "@cookids/domain/models/Order.js";

describe("FakeMailService", () => {
  it("conserve les confirmations envoyées", async () => {
    const mailService = new FakeMailService();
    const order: Order = {
      id: 42,
      createdAt: new Date(),
      customer: { firstName: "Camille", email: "camille@example.com" },
      deliveryLocation: "rosa-parks",
      items: [],
      total: 0,
      status: "new"
    };

    await mailService.sendOrderConfirmation(order);

    expect(mailService.sentOrders).toEqual([order]);
  });
});
