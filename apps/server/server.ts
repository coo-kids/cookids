import ordersHandler from "./handlers/orders.js";

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

export function createServer(opts?: Partial<Bun.Serve.Options<any>>){
  return Bun.serve({
    ...opts as any,
    routes: {
      "/health": () => Response.json({ status: "OK" }),
      "/orders": ordersHandler
    },
    fetch: notFound,
  });
}