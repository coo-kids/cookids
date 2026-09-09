import type { Product } from "../models/Product.js";

export abstract class CatalogProvider {
  abstract getProducts(): Promise<Product[]>;
}
