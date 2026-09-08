import type { Product } from "../models/Product";

export abstract class CatalogProvider {
  abstract getProducts(): Promise<Product[]>;
}
