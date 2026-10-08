import { computed, ref, watch } from "vue";
import { catalog, categories } from "../content/catalog.js";
import type { CartItem } from "@cookids/domain/models/CartItem";
import type { CartParticipant } from "../types/CartParticipant.js";

const CART_STORAGE_KEY = "cookids:cart";

type CartMode = "individual" | "grouped";
type StoredCart = {
  items: CartItem[];
  mode: CartMode;
  participants: CartParticipant[];
  activeParticipantId?: string;
};

export function cartItemKey(item: Pick<CartItem, "productId" | "toppingIds" | "participantId">): string {
  return [item.participantId, item.productId, ...(item.toppingIds ?? []).slice().sort()].filter(Boolean).join("::");
}

function isValidItem(item: unknown): item is CartItem {
  if (typeof item !== "object" || item === null || typeof (item as CartItem).productId !== "string") return false;
  const cartItem = item as CartItem;
  const product = catalog.find((product) => product.id === cartItem.productId);
  const toppingIds: string[] = Array.isArray(cartItem.toppingIds) && cartItem.toppingIds.every((id: unknown) => typeof id === "string") ? cartItem.toppingIds : [];
  const availableIds = new Set(product?.availableToppings?.map((topping) => topping.id) ?? []);
  return Boolean(
    product && Number.isInteger(cartItem.quantity) && cartItem.quantity > 0 && cartItem.quantity <= 480 &&
    (!product.quantityMultiple || cartItem.quantity % product.quantityMultiple === 0) &&
    (!cartItem.participantId || typeof cartItem.participantId === "string") &&
    toppingIds.every((id) => availableIds.has(id)),
  );
}

function loadCart(): StoredCart {
  const emptyCart: StoredCart = { items: [], mode: "individual", participants: [] };
  if (typeof localStorage === "undefined") return emptyCart;

  try {
    const stored: unknown = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    if (Array.isArray(stored)) return {
      ...emptyCart,
      items: stored.filter((item) => {
        if (!isValidItem(item)) return false;
        const minimumQuantity = catalog.find((product) => product.id === item.productId)?.minimumQuantity;
        return !minimumQuantity || item.quantity >= minimumQuantity;
      }),
    };
    if (typeof stored !== "object" || stored === null) return emptyCart;
    const candidate = stored as Partial<StoredCart>;
    const participants = Array.isArray(candidate.participants)
      ? candidate.participants.filter((participant): participant is CartParticipant => Boolean(
        participant && typeof participant.id === "string" && typeof participant.label === "string",
      ))
      : [];
    const mode = candidate.mode === "grouped" && participants.length > 0 ? "grouped" : "individual";
    const participantIds = new Set(participants.map(({ id }) => id));
    const loadedItems = Array.isArray(candidate.items) ? candidate.items.filter(isValidItem) : [];
    const items = mode === "grouped"
      ? loadedItems.filter((item) => item.participantId && participantIds.has(item.participantId))
      : loadedItems
        .filter((item) => {
          const minimumQuantity = catalog.find((product) => product.id === item.productId)?.minimumQuantity;
          return !minimumQuantity || item.quantity >= minimumQuantity;
        })
        .map(({ participantId: _participantId, ...item }) => item);
    const activeParticipantId = mode === "grouped" && candidate.activeParticipantId && participantIds.has(candidate.activeParticipantId)
      ? candidate.activeParticipantId
      : participants[0]?.id;

    return { items, mode, participants: mode === "grouped" ? participants : [], activeParticipantId };
  } catch {
    return emptyCart;
  }
}

const loadedCart = loadCart();
const items = ref<CartItem[]>(loadedCart.items);
const mode = ref<CartMode>(loadedCart.mode);
const participants = ref<CartParticipant[]>(loadedCart.participants);
const activeParticipantId = ref<string | undefined>(loadedCart.activeParticipantId);
const isCartOpen = ref(false);

watch([items, mode, participants, activeParticipantId], () => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      items: items.value,
      mode: mode.value,
      participants: participants.value,
      activeParticipantId: activeParticipantId.value,
    }));
  }
}, { deep: true, flush: "sync" });

export type CategoryComposition = {
  categoryId: string;
  categoryLabel: string;
  quantity: number;
  requiredQuantity: number;
  isValid: boolean;
};

export type MinimumComposition = {
  productId: string;
  productName: string;
  quantity: number;
  requiredQuantity: number;
  isValid: boolean;
};

function createParticipantId(): string {
  return `participant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useCart() {
  const isGrouped = computed(() => mode.value === "grouped");
  const activeParticipant = computed(() => participants.value.find(({ id }) => id === activeParticipantId.value));
  const hasValidParticipantLabels = computed(() => {
    if (!isGrouped.value) return true;
    const labels = participants.value.map(({ label }) => label.trim().toLocaleLowerCase("fr-FR"));
    return labels.length > 0 && labels.every(Boolean) && new Set(labels).size === labels.length;
  });
  const count = computed(() => items.value.reduce((total, item) => total + item.quantity, 0));
  const enrichedItems = computed(() => items.value.flatMap((item) => {
    const product = catalog.find((entry) => entry.id === item.productId);
    const participant = participants.value.find(({ id }) => id === item.participantId);
    return product ? [{
      ...item,
      key: cartItemKey(item),
      product,
      participantLabel: participant?.label.trim() || undefined,
      toppingLabels: item.toppingIds?.map((id) => product.availableToppings?.find((topping) => topping.id === id)?.label).filter((label): label is string => Boolean(label)),
      total: product.price * item.quantity,
    }] : [];
  }));
  const activeItems = computed(() => enrichedItems.value.filter((item) => !isGrouped.value || item.participantId === activeParticipantId.value));
  const total = computed(() => enrichedItems.value.reduce((amount, item) => amount + item.total, 0));
  const categoryCompositions = computed<CategoryComposition[]>(() => categories.flatMap((category) => {
    if (!category.quantityMultiple) return [];
    const quantity = enrichedItems.value.reduce(
      (sum, item) => sum + (item.product.category === category.id ? item.quantity : 0), 0,
    );
    const requiredQuantity = Math.max(category.quantityMultiple, Math.ceil(quantity / category.quantityMultiple) * category.quantityMultiple);
    return [{ categoryId: category.id, categoryLabel: category.label, quantity, requiredQuantity, isValid: quantity % category.quantityMultiple === 0 }];
  }));
  const minimumCompositions = computed<MinimumComposition[]>(() => catalog.flatMap((product) => {
    if (!product.minimumQuantity) return [];
    const quantity = enrichedItems.value.reduce(
      (sum, item) => sum + (item.productId === product.id ? item.quantity : 0), 0,
    );
    if (quantity === 0) return [];
    return [{
      productId: product.id,
      productName: product.name,
      quantity,
      requiredQuantity: product.minimumQuantity,
      isValid: quantity >= product.minimumQuantity,
    }];
  }));
  const isCompositionValid = computed(() =>
    categoryCompositions.value.every(({ isValid }) => isValid) &&
    minimumCompositions.value.every(({ isValid }) => isValid),
  );

  function setQuantity(productId: string, quantity: number): void {
    const existing = items.value.find((item) => item.productId === productId && (!isGrouped.value || item.participantId === activeParticipantId.value));
    setItemQuantity(existing ? cartItemKey(existing) : productId, quantity);
  }

  function setItemQuantity(key: string, quantity: number): void {
    const existingItem = items.value.find((item) => cartItemKey(item) === key);
    const productId = existingItem?.productId ?? key;
    const product = catalog.find((entry) => entry.id === productId);
    if (!product || (isGrouped.value && !activeParticipantId.value && !existingItem)) return;
    const quantityMultiple = product.quantityMultiple ?? 1;
    const maximumQuantity = Math.max(existingItem?.quantity ?? 0, Math.floor(48 / quantityMultiple) * quantityMultiple);
    const nextQuantity = Math.max(0, Math.min(maximumQuantity, quantity));
    if (nextQuantity % quantityMultiple !== 0) return;
    if (!isGrouped.value && nextQuantity > 0 && product.minimumQuantity && nextQuantity < product.minimumQuantity) return;
    const itemIndex = items.value.findIndex((item) => cartItemKey(item) === key);
    if (nextQuantity === 0) {
      if (itemIndex >= 0) items.value.splice(itemIndex, 1);
      return;
    }
    if (itemIndex >= 0) {
      items.value[itemIndex].quantity = nextQuantity;
      return;
    }
    items.value.push({ productId, quantity: nextQuantity, participantId: isGrouped.value ? activeParticipantId.value : undefined });
  }

  function addCustomizedProduct(productId: string, toppingIds: string[]): void {
    const product = catalog.find((entry) => entry.id === productId);
    if (!product?.availableToppings || (isGrouped.value && !activeParticipantId.value)) return;
    const sortedIds = [...new Set(toppingIds)].sort();
    const minimum = product.minimumToppings ?? 1;
    const maximum = product.maximumToppings ?? product.availableToppings.length;
    const allowedIds = new Set(product.availableToppings.map((topping) => topping.id));
    if (sortedIds.length < minimum || sortedIds.length > maximum || sortedIds.some((id) => !allowedIds.has(id))) return;

    const item = { productId, toppingIds: sortedIds, participantId: isGrouped.value ? activeParticipantId.value : undefined };
    const key = cartItemKey(item);
    const existing = items.value.find((entry) => cartItemKey(entry) === key);
    if (existing) {
      setItemQuantity(key, existing.quantity + (product.quantityMultiple ?? 1));
      return;
    }
    items.value.push({ ...item, quantity: product.quantityMultiple ?? 1 });
  }

  function quantityFor(productId: string): number {
    return items.value.find((item) => item.productId === productId && (!isGrouped.value || item.participantId === activeParticipantId.value))?.quantity ?? 0;
  }

  function enableGroupedOrder(): void {
    if (isGrouped.value) return;
    const participant: CartParticipant = { id: createParticipantId(), label: "" };
    participants.value = [participant];
    activeParticipantId.value = participant.id;
    items.value = items.value.map((item) => ({ ...item, participantId: participant.id }));
    mode.value = "grouped";
  }

  function disableGroupedOrder(): void {
    if (!isGrouped.value) return;
    const merged = new Map<string, CartItem>();
    for (const { participantId: _participantId, ...item } of items.value) {
      const key = cartItemKey(item);
      const existing = merged.get(key);
      if (existing) existing.quantity += item.quantity;
      else merged.set(key, { ...item });
    }
    items.value = [...merged.values()];
    participants.value = [];
    activeParticipantId.value = undefined;
    mode.value = "individual";
  }

  function addParticipant(): void {
    if (!isGrouped.value) return;
    const participant = { id: createParticipantId(), label: "" };
    participants.value.push(participant);
    activeParticipantId.value = participant.id;
  }

  function updateParticipantLabel(participantId: string, label: string): void {
    const participant = participants.value.find(({ id }) => id === participantId);
    if (participant) participant.label = label.slice(0, 80);
  }

  function removeParticipant(participantId: string): void {
    if (!isGrouped.value || participants.value.length <= 1) return;
    const index = participants.value.findIndex(({ id }) => id === participantId);
    if (index < 0) return;
    items.value = items.value.filter((item) => item.participantId !== participantId);
    participants.value.splice(index, 1);
    if (activeParticipantId.value === participantId) {
      activeParticipantId.value = participants.value[Math.min(index, participants.value.length - 1)]?.id;
    }
  }

  function clear(): void {
    items.value = [];
    mode.value = "individual";
    participants.value = [];
    activeParticipantId.value = undefined;
    if (typeof localStorage !== "undefined") localStorage.removeItem(CART_STORAGE_KEY);
  }

  return {
    count, enrichedItems, activeItems, total, categoryCompositions, minimumCompositions, isCompositionValid, isCartOpen,
    mode, isGrouped, participants, activeParticipantId, activeParticipant, hasValidParticipantLabels,
    setQuantity, setItemQuantity, addCustomizedProduct, quantityFor, enableGroupedOrder, disableGroupedOrder,
    addParticipant, updateParticipantLabel, removeParticipant, clear,
  };
}
