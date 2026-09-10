import { BadRequest } from "@tsed/exceptions";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requestContext, getContext } = vi.hoisted(() => {
  const requestContext: { error?: unknown } = {};
  return { requestContext, getContext: vi.fn(() => requestContext) };
});

vi.mock("@tsed/di", () => ({ context: getContext }));

import { createErrorResponse } from "./createErrorResponse.js";

describe("createErrorResponse", () => {
  beforeEach(() => {
    requestContext.error = undefined;
    getContext.mockClear();
  });

  it("sérialise une exception HTTP contrôlée", async () => {
    const error = Object.assign(new BadRequest("Commande invalide"), { code: "INVALID_ORDER" });

    const response = createErrorResponse(error);

    expect(response.status).toBe(400);
    expect(requestContext.error).toBe(error);
    await expect(response.json()).resolves.toEqual({ error: { code: "INVALID_ORDER", message: "Commande invalide" } });
  });

  it("normalise une exception HTTP sans code et les erreurs inconnues", async () => {
    const error = Object.assign(new BadRequest("Commande invalide"), { code: 42 });
    await expect(createErrorResponse(error).json()).resolves.toEqual({ error: { code: "HTTP_ERROR", message: "Commande invalide" } });
    await expect(createErrorResponse(new Error("unexpected")).json()).resolves.toEqual({
      error: { code: "ORDER_PROCESSING_FAILED", message: "La commande n'a pas pu être enregistrée." }
    });
  });
});
