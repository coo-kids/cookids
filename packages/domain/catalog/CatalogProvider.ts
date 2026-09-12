import type { ContentCatalog } from "../schemas/ContentCatalogSchema.js";

export abstract class CatalogProvider {
  abstract getCatalog(): Promise<ContentCatalog>;
}
