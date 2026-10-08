import { computed, ref, watch } from "vue";
import { catalog, categories } from "../content/catalog.js";
import type { CartItem } from "@cookids/domain/models/CartItem";

const CART_STORAGE_KEY = "cookids:cart";

export function cartItemKey(item: Pick<CartItem, "productId" | "toppingIds">): string {
  return [item.productId, ...(item.toppingIds ?? []).slice().sort()].join("::");
}

function loadItems(): CartItem[] {
  if (typeof localStorage === "undefined") return [];

  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(stored)) return [];

    return stored.filter((item): item is CartItem => {
      if (typeof item !== "object" || item === null || typeof item.productId !== "string") return false;
      const product = catalog.find((product) => product.id === item.productId);
      const toppingIds: string[] = Array.isArray(item.toppingIds) && item.toppingIds.every((id: unknown) => typeof id === "string") ? item.toppingIds : [];
      const availableIds = new Set(product?.availableToppings?.map((topping) => topping.id) ?? []);
      return Boolean(
        product && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 48 &&
        (!product.quantityMultiple || item.quantity % product.quantityMultiple === 0) &&
        (!product.minimumQuantity || item.quantity >= product.minimumQuantity) &&
        toppingIds.every((id) => availableIds.has(id)),
      );
    });
  } catch {
    return [];
  }
}

const items = ref<CartItem[]>(loadItems());
const isCartOpen = ref(false);

watch(items, (value) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(value));
  }
}, { deep: true, flush: "sync" });

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
        ? [{
          ...item,
          key: cartItemKey(item),
          product,
          toppingLabels: item.toppingIds?.map((id) => product.availableToppings?.find((topping) => topping.id === id)?.label).filter((label): label is string => Boolean(label)),
          total: product.price * item.quantity,
        }]
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
    setItemQuantity(productId, quantity);
  }

  function setItemQuantity(key: string, quantity: number): void {
    const existingItem = items.value.find((item) => cartItemKey(item) === key);
    const productId = existingItem?.productId ?? key;
    const product = catalog.find((product) => product.id === productId);
    const quantityMultiple = product?.quantityMultiple ?? 1;
    const maximumQuantity = Math.floor(48 / quantityMultiple) * quantityMultiple;
    const nextQuantity = Math.max(0, Math.min(maximumQuantity, quantity));
    if (nextQuantity % quantityMultiple !== 0) return;
    if (nextQuantity > 0 && product?.minimumQuantity && nextQuantity < product.minimumQuantity) return;
    const itemIndex = items.value.findIndex((item) => cartItemKey(item) === key);
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

  function addCustomizedProduct(productId: string, toppingIds: string[]): void {
    const product = catalog.find((product) => product.id === productId);
    if (!product?.availableToppings) return;
    const sortedIds = [...new Set(toppingIds)].sort();
    const minimum = product.minimumToppings ?? 1;
    const maximum = product.maximumToppings ?? product.availableToppings.length;
    const allowedIds = new Set(product.availableToppings.map((topping) => topping.id));
    if (sortedIds.length < minimum || sortedIds.length > maximum || sortedIds.some((id) => !allowedIds.has(id))) return;

    const item = { productId, toppingIds: sortedIds };
    const key = cartItemKey(item);
    const existing = items.value.find((entry) => cartItemKey(entry) === key);
    if (existing) {
      setItemQuantity(key, existing.quantity + (product.quantityMultiple ?? 1));
      return;
    }
    items.value.push({ ...item, quantity: product.quantityMultiple ?? 1 });
  }

  function quantityFor(productId: string): number {
    return (
      items.value.find((item) => item.productId === productId)?.quantity ?? 0
    );
  }

  function clear(): void {
    items.value = [];
    if (typeof localStorage !== "undefined") localStorage.removeItem(CART_STORAGE_KEY);
  }

  return {
    count,
    enrichedItems,
    total,
    categoryCompositions,
    isCompositionValid,
    isCartOpen,
    setQuantity,
    setItemQuantity,
    addCustomizedProduct,
    quantityFor,
    clear,
  };
}
