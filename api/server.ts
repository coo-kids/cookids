import { handleOrderRequest } from "../apps/server/handlers/orders.js";

function notFound() {
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
    "/health": () => Response.json({ status: "OK" }),
    "/orders": (request) => {
      if (request.method == "POST") {
        return handleOrderRequest(request);
      }

      return notFound();
    }
  },
  fetch: notFound
});
