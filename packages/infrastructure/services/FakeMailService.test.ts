import { describe, expect, it } from "vitest";
import type { Order } from "@cookids/domain";
import { FakeMailService } from "./FakeMailService.js";

describe("FakeMailService", () => {
  it("conserve les confirmations envoyées", async () => {
    const mailService = new FakeMailService();
    const order = { id: "CK-20260909-ABCD" } as Order;

    await mailService.sendOrderConfirmation(order);

    expect(mailService.sentOrders).toEqual([order]);
  });
});
