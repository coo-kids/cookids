import { Exception } from "@tsed/exceptions";
import { context } from "@tsed/di";

function getErrorCode(error: Exception): string {
  return typeof error.code === "string" ? error.code : "HTTP_ERROR";
}

export function createErrorResponse(error: unknown): Response {
  context().error = error;

  if (error instanceof Exception) {
    return Response.json({
      error: {
        code: getErrorCode(error),
        message: error.message
      }
    }, { status: error.status });
  }

  return Response.json({
    error: {
      code: "ORDER_PROCESSING_FAILED",
      message: "La commande n'a pas pu être enregistrée."
    }
  }, { status: 500 });
}
