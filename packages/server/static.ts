import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const webDistDirectory = fileURLToPath(new URL("../../public", import.meta.url));

function resolveAssetPath(pathname: string): string | undefined {
  let decodedPathname: string;

  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    return undefined;
  }

  const relativePath = decodedPathname === "/" ? "index.html" : decodedPathname.slice(1);
  const assetPath = resolve(webDistDirectory, relativePath);

  return assetPath.startsWith(`${webDistDirectory}${sep}`) ? assetPath : undefined;
}

function isAssetRequest(pathname: string): boolean {
  return extname(pathname) !== "" || pathname.startsWith("/assets/");
}

export async function serveStaticAsset(request: Request): Promise<Response | undefined> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return undefined;
  }

  const { pathname } = new URL(request.url);
  const assetPath = resolveAssetPath(pathname);

  if (assetPath) {
    const asset = Bun.file(assetPath);

    if (await asset.exists()) {
      return new Response(request.method === "HEAD" ? undefined : asset, {
        headers: {
          "Content-Type": asset.type,
          "Content-Length": String(asset.size)
        }
      });
    }
  }

  if (!pathname.startsWith("/api/") && !isAssetRequest(pathname)) {
    const index = Bun.file(resolve(webDistDirectory, "index.html"));

    if (await index.exists()) {
      return new Response(request.method === "HEAD" ? undefined : index, {
        headers: {
          "Content-Type": index.type,
          "Content-Length": String(index.size)
        }
      });
    }
  }

  return undefined;
}
