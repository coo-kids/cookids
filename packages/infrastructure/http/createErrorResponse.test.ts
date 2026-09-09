import { BadRequest } from "@tsed/exceptions";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createErrorResponse } from "./createErrorResponse.js";

describe("createErrorResponse", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sérialise une exception HTTP contrôlée", async () => {
    const error = Object.assign(new BadRequest("Commande invalide"), { code: "INVALID_ORDER" });

    const response = createErrorResponse(error);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: { code: "INVALID_ORDER", message: "Commande invalide" } });
  });

  it("normalise une exception HTTP sans code et les erreurs inconnues", async () => {
    const error = Object.assign(new BadRequest("Commande invalide"), { code: 42 });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(createErrorResponse(error).json()).resolves.toEqual({ error: { code: "HTTP_ERROR", message: "Commande invalide" } });
    await expect(createErrorResponse(new Error("unexpected")).json()).resolves.toEqual({
      error: { code: "ORDER_PROCESSING_FAILED", message: "La commande n'a pas pu être enregistrée." }
    });
    expect(consoleError).toHaveBeenCalledWith("Order processing failed", expect.any(Error));
  });
});
