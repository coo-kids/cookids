import { fileURLToPath } from "node:url";
import { CatalogProvider, ContentValidationService, type Product } from "@cookids/domain";
import { parse } from "yaml";

declare const Bun: { file(path: string): { text(): Promise<string> } };

const catalogPath = fileURLToPath(new URL("../../../contents/catalog.yml", import.meta.url));

export class BunCatalogProvider extends CatalogProvider {
  private productsPromise: Promise<Product[]> | undefined;
  private readonly contentValidationService = new ContentValidationService();

  getProducts(): Promise<Product[]> {
    this.productsPromise ??= this.loadProducts();
    return this.productsPromise;
  }

  private async loadProducts(): Promise<Product[]> {
    const contentCatalog = await this.contentValidationService.validateCatalog(parse(await Bun.file(catalogPath).text()));
    return contentCatalog.products.map((product) => ({
      ...product,
      priceCents: Math.round(product.price * 100)
    }));
  }
}
