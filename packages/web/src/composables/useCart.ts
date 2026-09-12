import { computed, ref } from "vue";
import { catalog, categories } from "../content/catalog.js";
import type { CartItem } from "@cookids/domain/models/CartItem";

const items = ref<CartItem[]>([]);
const isCartOpen = ref(false);

export type CategoryComposition = {
  categoryId: string;
  categoryLabel: string;
  quantity: number;
  requiredQuantity: number;
  isValid: boolean;
};

export function useCart() {
  const count = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0),
  );
  const enrichedItems = computed(() =>
    items.value.flatMap((item) => {
      const product = catalog.find((entry) => entry.id === item.productId);
      return product
        ? [{ ...item, product, total: product.price * item.quantity }]
        : [];
    }),
  );
  const total = computed(() =>
    enrichedItems.value.reduce((amount, item) => amount + item.total, 0),
  );
  const categoryCompositions = computed<CategoryComposition[]>(() =>
    categories.flatMap((category) => {
      if (!category.quantityMultiple) return [];

      const quantity = enrichedItems.value.reduce(
        (total, item) => total + (item.product.category === category.id ? item.quantity : 0),
        0,
      );
      const requiredQuantity = Math.max(
        category.quantityMultiple,
        Math.ceil(quantity / category.quantityMultiple) * category.quantityMultiple,
      );

      return [{
        categoryId: category.id,
        categoryLabel: category.label,
        quantity,
        requiredQuantity,
        isValid: quantity % category.quantityMultiple === 0,
      }];
    }),
  );
  const isCompositionValid = computed(() =>
    categoryCompositions.value.every((composition) => composition.isValid),
  );

  function setQuantity(productId: string, quantity: number): void {
    const nextQuantity = Math.max(0, Math.min(48, quantity));
    const itemIndex = items.value.findIndex(
      (item) => item.productId === productId,
    );
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
    return (
      items.value.find((item) => item.productId === productId)?.quantity ?? 0
    );
  }

  function clear(): void {
    items.value = [];
  }

  return {
    count,
    enrichedItems,
    total,
    categoryCompositions,
    isCompositionValid,
    isCartOpen,
    setQuantity,
    quantityFor,
    clear,
  };
}
