import type { CartItem } from "@cookids/domain/models/CartItem";
import type { Product } from "@cookids/domain/models/Product";

export interface EnrichedCartItem extends CartItem {
  key: string;
  product: Product;
  toppingLabels?: string[];
  participantLabel?: string;
  total: number;
}
