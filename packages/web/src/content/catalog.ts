import catalogSource from "../../../../contents/catalog.yml";
import { validateCatalog } from "./validateContent.js";
import type { ContentCatalog } from "@cookids/domain/schemas/ContentCatalogSchema.js";
import type { Product } from "@cookids/domain/models/Product.js";

const contentCatalog: ContentCatalog = await validateCatalog(catalogSource);

export const catalog: Product[] = contentCatalog.products;
