import type { Product } from "../models/Product";

export function findProduct(catalog: Product[], productId: string): Product | undefined {
  return catalog.find((product) => product.id === productId);
}
