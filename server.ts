import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { handleOrderRequest } from "./apps/server/handlers/orders.js";

const webDistPath = fileURLToPath(new URL("./apps/web/dist/", import.meta.url));
const indexFilePath = resolve(webDistPath, "index.html");

function findStaticFile(pathname: string): Bun.BunFile | undefined {
  const filePath = resolve(webDistPath, `.${pathname}`);

  if (!filePath.startsWith(`${webDistPath}${sep}`)) {
    return undefined;
  }

  return Bun.file(filePath);
}

async function serveApplication(pathname: string): Promise<Response> {
  const staticFile = findStaticFile(pathname);

  if (staticFile && await staticFile.exists()) {
    return new Response(staticFile);
  }

  return new Response(Bun.file(indexFilePath));
}

export async function handleRequest(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);

  if (pathname === "/api/orders") {
    return handleOrderRequest(request);
  }

  return serveApplication(pathname);
}

Bun.serve({ fetch: handleRequest });
