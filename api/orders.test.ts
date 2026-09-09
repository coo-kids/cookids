import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler from "./orders";

type CapturedResponse = {
  statusCode?: number;
  payload?: unknown;
  response: VercelResponse;
};

function createCapturedResponse(): CapturedResponse {
  const captured: CapturedResponse = {} as CapturedResponse;
  captured.response = {
    status(statusCode: number) {
      captured.statusCode = statusCode;
      return this;
    },
    json(payload: unknown) {
      captured.payload = payload;
      return this;
    }
  } as VercelResponse;
  return captured;
}
describe('orders', () => {
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

  it("POST /api/orders retourne une commande sérialisée", async () => {
    const captured = createCapturedResponse();
    await handler({
      method: "POST",
      body: {
        firstName: "Camille",
        deliveryLocation: "rosa-parks",
        email: "camille@example.com",
        items: [{ productId: "cookie-cafe-noix", quantity: 2 }]
      }
    } as VercelRequest, captured.response);

    expect(captured.statusCode).toBe(201);
    expect(captured.payload).toMatchObject({
      order: {
        totalPrice: 2
      }
    });
  });

  it("POST /api/orders sérialise les exceptions Ts.ED", async () => {
    const captured = createCapturedResponse();
    await handler({
      method: "POST",
      body: { firstName: "Camille", email: "invalide", deliveryLocation: "rosa-parks", items: [] }
    } as VercelRequest, captured.response);

    expect(captured.statusCode).toBe(400);
    expect(captured.payload).toEqual({
      error: {
        code: "INVALID_ORDER",
        message: "La commande n'est pas valide."
      }
    });
  });

})
