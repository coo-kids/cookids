import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import handleOrderRequest from "./orders.js";

describe("handleOrderRequest", () => {
  beforeAll(() => {
    vi.stubGlobal("Bun", {
      file(path: string) {
        return { text: () => readFile(path, "utf8") };
      }
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("crée une commande via POST /api/orders", async () => {
    const response = await handleOrderRequest(new Request("https://cookids.test/api/orders", {
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

  it("retourne une erreur métier sérialisée", async () => {
    const response = await handleOrderRequest(new Request("https://cookids.test/api/orders", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Camille",
        email: "invalide",
        deliveryLocation: "rosa-parks",
        items: []
      })
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INVALID_ORDER",
        message: "La commande n'est pas valide."
      }
    });
  });
});
