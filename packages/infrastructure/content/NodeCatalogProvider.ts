import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { validate } from "@tsed/ajv";
import { CatalogProvider } from "@cookids/domain/catalog/CatalogProvider.js";
import type { Product } from "@cookids/domain/models/Product.js";
import {
  type ContentCatalog,
  ContentCatalogSchema
} from "@cookids/domain/schemas/ContentCatalogSchema.js";

const catalogPath = fileURLToPath(
  new URL("../../../contents/catalog.yml", import.meta.url)
);

export class NodeCatalogProvider extends CatalogProvider {
  private productsPromise: Promise<Product[]> | undefined;

  getProducts(): Promise<Product[]> {
    this.productsPromise ??= this.loadProducts();
    return this.productsPromise;
  }

  private async loadProducts(): Promise<Product[]> {
    const contentCatalog = parse(await readFile(catalogPath, "utf8"));
    const validatedCatalog = await validate<ContentCatalog>(contentCatalog, {
      type: ContentCatalogSchema
    });

    return validatedCatalog.products;
  }
}
