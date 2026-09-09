import { describe, expect, it, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { defineHandler } from "./defineHandler.js";

function createResponse(): { statusCode?: number; payload?: unknown; response: VercelResponse } {
  const captured: { statusCode?: number; payload?: unknown; response: VercelResponse } = {} as never;
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

describe("defineHandler", () => {
  it("rejette les méthodes non autorisées sans appeler le handler", async () => {
    const callback = vi.fn();
    const handler = defineHandler({ method: "POST", handler: callback });
    const captured = createResponse();

    await handler({ method: "GET" } as VercelRequest, captured.response);

    expect(callback).not.toHaveBeenCalled();
    expect(captured).toMatchObject({ statusCode: 405, payload: { error: { code: "METHOD_NOT_ALLOWED" } } });
  });

  it("sérialise les erreurs inattendues du callback", async () => {
    const handler = defineHandler({ method: "POST", handler: () => { throw new Error("unexpected"); } });
    const captured = createResponse();
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await handler({ method: "POST" } as VercelRequest, captured.response);

    expect(captured).toMatchObject({ statusCode: 500, payload: { error: { code: "ORDER_PROCESSING_FAILED" } } });
  });
});
