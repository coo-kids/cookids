import { describe, expect, it } from "vitest";
import ordersApi from "./orders.js";

describe("ordersApi", () => {
  it("initialise les providers avant de traiter une commande", async () => {
    const response = await ordersApi.fetch(new Request("https://cookids.test/api/orders", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Camille",
        deliveryLocation: "le-perreux-sur-marne",
        email: "camille@example.com",
        items: [{ productId: "cookie-cafe-noix", quantity: 2 }]
      })
    }));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ order: { total: 2 } });
  });
});
