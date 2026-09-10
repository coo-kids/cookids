import ordersHandler from "../apps/server/handlers/orders.js";

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
    "/orders": ordersHandler
  },
  fetch: notFound
});
