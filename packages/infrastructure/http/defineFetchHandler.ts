import { DIContext, injector, runInContext } from "@tsed/di";
import { createErrorResponse } from "./createErrorResponse.js";
import { randomUUID } from "crypto";

type DefineFetchHandlerOpts = {
  method: "GET" | "POST" | "PATCH" | "PUT";
  handler(request: Request): Promise<Response> | Response;
};

export function defineFetchHandler(opts: DefineFetchHandlerOpts) {
  const initialization = injector().load();

  return async function handler(request: Request): Promise<Response> {
    await initialization;


    const ctx = new DIContext({
      id: request.headers.get("x-request-id") || randomUUID()
    })
      .set("request", request);
    if (request.method !== opts.method) {
      return Response.json({
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: "Méthode non autorisée."
        }
      }, { status: 405 });
    }

    const result = await runInContext(ctx, async () => {
      try {
        return await opts.handler(request);
      } catch (error) {
        return createErrorResponse(error);
      }
    });

    if (result.ok) {
      ctx.logger.info({
        event: "request.end",
        url: result.url,
        status: result.statusText,
        status_code: result.status,
        request_header: result.headers,
        response_headers: result.headers
      });
    } else {
      ctx.logger.error({
        event: "request.end",
        url: result.url,
        status: result.statusText,
        status_code: result.status,
        request_header: result.headers,
        response_headers: result.headers,
        response_body: result.body
      });
    }

    return result;
  };
}
