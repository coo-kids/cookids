import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const webDistDirectory = fileURLToPath(new URL("../web/dist", import.meta.url));

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

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

async function readStaticFile(path: string): Promise<{ content: ArrayBuffer; contentType: string } | undefined> {
  try {
    const fileStats = await stat(path);

    if (!fileStats.isFile()) {
      return undefined;
    }

    return {
      content: Uint8Array.from(await readFile(path)).buffer,
      contentType: contentTypes[extname(path)] ?? "application/octet-stream",
    };
  } catch {
    return undefined;
  }
}

export async function serveStaticAsset(request: Request): Promise<Response | undefined> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return undefined;
  }

  const { pathname } = new URL(request.url);
  const assetPath = resolveAssetPath(pathname);

  if (assetPath) {
    const asset = await readStaticFile(assetPath);

    if (asset) {
      return new Response(request.method === "HEAD" ? undefined : asset.content, {
        headers: {
          "Content-Type": asset.contentType,
          "Content-Length": String(asset.content.byteLength)
        }
      });
    }
  }

  if (!pathname.startsWith("/api/") && !isAssetRequest(pathname)) {
    const index = await readStaticFile(resolve(webDistDirectory, "index.html"));

    if (index) {
      return new Response(request.method === "HEAD" ? undefined : index.content, {
        headers: {
          "Content-Type": index.contentType,
          "Content-Length": String(index.content.byteLength)
        }
      });
    }
  }

  return undefined;
}
