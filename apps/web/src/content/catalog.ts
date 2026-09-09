import type { ContentCatalog, Product } from "@cookids/domain";
import catalogSource from "../../../../contents/catalog.yml";
import { validateCatalog } from "./validateContent";

const contentCatalog: ContentCatalog = await validateCatalog(catalogSource);

export const catalog: Product[] = contentCatalog.products.map((product) => ({
  ...product,
  price: Math.round(product.price * 100),
}));
