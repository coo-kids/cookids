import { injector } from "@tsed/di";
import { createErrorResponse } from "./createErrorResponse.js";

type DefineFetchHandlerOpts = {
  method: "GET" | "POST" | "PATCH" | "PUT";
  handler(request: Request): Promise<Response> | Response;
};

export function defineFetchHandler(opts: DefineFetchHandlerOpts) {
  const initialization = injector().load();

  return async function handler(request: Request): Promise<Response> {
    await initialization;

    if (request.method !== opts.method) {
      return Response.json({
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: "Méthode non autorisée."
        }
      }, { status: 405 });
    }

    try {
      return await opts.handler(request);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
}
