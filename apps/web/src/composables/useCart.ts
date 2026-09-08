import { computed, ref } from "vue";
import { catalog } from "../content/catalog";
import type { CartItem } from "@cookids/domain/models/CartItem";

const items = ref<CartItem[]>([]);
const isCartOpen = ref(false);

export function useCart() {
  const count = computed(() => items.value.reduce((total, item) => total + item.quantity, 0));
  const enrichedItems = computed(() => items.value.flatMap((item) => {
    const product = catalog.find((entry) => entry.id === item.productId);
    return product ? [{ ...item, product, totalCents: product.priceCents * item.quantity }] : [];
  }));
  const totalCents = computed(() => enrichedItems.value.reduce((total, item) => total + item.totalCents, 0));

  function setQuantity(productId: string, quantity: number): void {
    const nextQuantity = Math.max(0, Math.min(48, quantity));
    const itemIndex = items.value.findIndex((item) => item.productId === productId);
    if (nextQuantity === 0) {
      if (itemIndex >= 0) items.value.splice(itemIndex, 1);
      return;
    }
    if (itemIndex >= 0) {
      items.value[itemIndex].quantity = nextQuantity;
      return;
    }
    items.value.push({ productId, quantity: nextQuantity });
  }

  function quantityFor(productId: string): number {
    return items.value.find((item) => item.productId === productId)?.quantity ?? 0;
  }

  function clear(): void {
    items.value = [];
  }

  return { count, enrichedItems, totalCents, isCartOpen, setQuantity, quantityFor, clear };
}
