import "@cookids/infrastructure/config/index.js"
import ordersHandler from "@cookids/server/handlers/orders/handler.js";
import healthHandler from "@cookids/server/handlers/health/handler.js";
import { serveStaticAsset } from "@cookids/infrastructure/http/static.js";

async function fetch(request: Request) {
  const staticAsset = await serveStaticAsset(request);

  if (staticAsset) {
    return staticAsset;
  }

  return Response.json(
    {
      "status": "NOT_FOUND"
    },
    {
      status: 404,
      statusText: "NOT_FOUND"
    });
}

Bun.serve({
  routes: {
    ...healthHandler,
    ...ordersHandler,
  },
  fetch,
});