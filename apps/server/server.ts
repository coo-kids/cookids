import ordersHandler from "./handlers/orders/handler.js";
import healthHandler from "./handlers/health/handler.js";

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
      ...healthHandler,
      ...ordersHandler,
    },
    // error(){
    //
    // },
    fetch: notFound,
  });
}
