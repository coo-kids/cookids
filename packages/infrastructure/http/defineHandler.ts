import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createErrorResponse } from "./createErrorResponse.js";
import { injector } from "@tsed/di";

type DefineHandlerOpts = {
  method: "GET" | "POST" | "PATCH" | "PUT";
  handler(request: VercelRequest): Promise<Response> | Response;
}

export function defineHandler(opts: DefineHandlerOpts) {
  const promise = injector().load();

  return async function handler(request: VercelRequest, response: VercelResponse): Promise<void> {
    await promise;

    if (request.method !== opts.method) {
      response.status(405).json({
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: "Méthode non autorisée."
        }
      });
      return;
    }

    try {
      const result = await opts.handler(request);

      response.status(result.status).json(await result.json());
    } catch (error) {
      const result = createErrorResponse(error);

      response.status(result.status).json(await result.json());
    }
  };
}
