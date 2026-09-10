import ordersHandler from "./handlers/orders/handler.js";
import healthHandler from "./handlers/health/handler.js";
import { serveStaticAsset } from "./static.js";

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
    fetch,
  });
}
