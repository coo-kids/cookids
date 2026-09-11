import { describe, expect, it } from "vitest";
import handleOrderRequest from "./handler.js";

describe("handleOrderRequest", () => {
  it("crée une commande via POST /api/orders", async () => {
    const response = await handleOrderRequest(new Request("https://cookids.test/api/orders", {
      method: "POST",
      body: JSON.stringify({
        createdAt: "2000-01-01T00:00:00.000Z",
        total: 999,
        status: "new",
        customer: {
          firstName: " Camille ",
          lastName: " Dupont ",
          email: "CAMILLE@EXAMPLE.COM",
          phoneNumber: " 0600000000 "
        },
        deliveryLocation: "IFSSO_kgDOBOB43g",
        targetDeliveryDate: "2026-10-01T00:00:00.000Z",
        items: [{
          productId: "cookie-cafe-noix",
          quantity: 2,
          productName: "Prix falsifié",
          unitPrice: 999,
          total: 999
        }]
      })
    }));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      order: {
        total: 2,
        status: "new",
        targetDeliveryDate: "2026-10-01T00:00:00.000Z",
        customer: {
          firstName: "Camille",
          lastName: "Dupont",
          email: "camille@example.com",
          phoneNumber: "0600000000"
        }
      }
    });
  });

  it.each([
    {
      customer: { firstName: "Camille", email: "invalide" },
      deliveryLocation: "IFSSO_kgDOBOB43A",
      items: []
    },
    {
      customer: { firstName: "Camille", email: "camille@example.com" },
      deliveryLocation: "IFSSO_kgDOBOB43A",
      items: [{ productId: "cookie-cafe-noix", quantity: 49 }]
    }
  ])("retourne une erreur pour un payload invalide", async (payload) => {
    const response = await handleOrderRequest(new Request("https://cookids.test/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "HTTP_ERROR"
      }
    });
  });

  it("rejette un corps JSON invalide", async () => {
    const response = await handleOrderRequest(new Request("https://cookids.test/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{"
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "HTTP_ERROR",
        message: "Le corps JSON est invalide."
      }
    });
  });

});
