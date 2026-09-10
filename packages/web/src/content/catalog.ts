import type { ContentCatalog, Product } from "@cookids/domain";
import catalogSource from "../../../../contents/catalog.yml";
import { validateCatalog } from "./validateContent.js";

const contentCatalog: ContentCatalog = await validateCatalog(catalogSource);

export const catalog: Product[] = contentCatalog.products;
