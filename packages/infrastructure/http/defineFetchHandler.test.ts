import { describe, expect, it, vi } from "vitest";
import { defineFetchHandler } from "./defineFetchHandler.js";

describe("defineFetchHandler", () => {
  it("rejette les méthodes non autorisées sans appeler le handler", async () => {
    const callback = vi.fn();
    const route = defineFetchHandler({ path: "/api/orders", method: "POST", handler: callback });

    const response = await route(new Request("https://cookids.test/api/orders"));

    expect(callback).not.toHaveBeenCalled();
    expect(response.status).toBe(405);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Méthode non autorisée."
      }
    });
  });

  it("sérialise les erreurs inattendues du callback", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const route = defineFetchHandler({
      path: "/api/orders",
      method: "POST",
      handler: () => { throw new Error("unexpected"); }
    });

    const response = await route(new Request("https://cookids.test/api/orders", { method: "POST" }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "ORDER_PROCESSING_FAILED",
        message: "La commande n'a pas pu être enregistrée."
      }
    });
  });
});
