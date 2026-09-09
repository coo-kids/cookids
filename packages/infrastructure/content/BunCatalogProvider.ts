import { fileURLToPath } from "node:url";
import {
  CatalogProvider,
  type ContentCatalog,
  ContentCatalogSchema,
  type Product
} from "@cookids/domain";
import { parse } from "yaml";
import { validate } from "@tsed/ajv";

declare const Bun: { file(path: string): { text(): Promise<string> } };

const catalogPath = fileURLToPath(new URL("../../../contents/catalog.yml", import.meta.url));

export class BunCatalogProvider extends CatalogProvider {
  private productsPromise: Promise<Product[]> | undefined;

  getProducts(): Promise<Product[]> {
    this.productsPromise ??= this.loadProducts();
    return this.productsPromise;
  }

  private async loadProducts(): Promise<Product[]> {
    const contentCatalog = parse(await Bun.file(catalogPath).text());
    const validatedCatalog = await validate<ContentCatalog>(contentCatalog, { type: ContentCatalogSchema });

    return validatedCatalog.products.map((product) => ({
      ...product,
      priceCents: Math.round(product.price * 100)
    }));
  }
}
