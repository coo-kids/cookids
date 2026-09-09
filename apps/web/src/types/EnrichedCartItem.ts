import type { CartItem } from "@cookids/domain/models/CartItem";
import type { Product } from "@cookids/domain/models/Product";

export interface EnrichedCartItem extends CartItem {
  product: Product;
  total: number;
}
