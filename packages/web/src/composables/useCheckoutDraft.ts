import { ref } from "vue";
import type { CheckoutDetails } from "../types/CheckoutDetails.js";
import { locations } from "../content/locations.js";

const CHECKOUT_STORAGE_KEY = "cookids:checkout-draft";
type CheckoutStep = 1 | 2 | 3;

interface StoredCheckoutDraft {
  details: CheckoutDetails | null;
  step: CheckoutStep;
}

function optionalString(value: unknown, maximumLength: number): string | undefined {
  return typeof value === "string" && value.length <= maximumLength && value.length > 0 ? value : undefined;
}

function parseDetails(value: unknown): CheckoutDetails | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Record<string, unknown>;
  const firstName = typeof candidate.firstName === "string" && candidate.firstName.length <= 100 ? candidate.firstName : "";
  const email = typeof candidate.email === "string" && candidate.email.length <= 254 ? candidate.email : "";
  const deliveryLocation = typeof candidate.deliveryLocation === "string" && locations.some((location) => location.id === candidate.deliveryLocation)
    ? candidate.deliveryLocation
    : "";

  return {
    firstName,
    email,
    deliveryLocation,
    lastName: optionalString(candidate.lastName, 100),
    phoneNumber: optionalString(candidate.phoneNumber, 30),
    targetDeliveryDate: optionalString(candidate.targetDeliveryDate, 10),
    deliveryComment: optionalString(candidate.deliveryComment, 500),
  };
}

function loadDraft(): StoredCheckoutDraft {
  if (typeof localStorage === "undefined") return { details: null, step: 1 };

  try {
    const stored = JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY) ?? "null") as Record<string, unknown> | null;
    const details = parseDetails(stored?.details);
    const step = stored?.step === 2 || (stored?.step === 3 && details) ? stored.step : 1;
    return { details, step };
  } catch {
    return { details: null, step: 1 };
  }
}

const initialDraft = loadDraft();
const details = ref<CheckoutDetails | null>(initialDraft.details);
const step = ref<CheckoutStep>(initialDraft.step);

function persist(): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify({ details: details.value, step: step.value }));
  }
}

export function useCheckoutDraft() {
  function saveDetails(value: CheckoutDetails): void {
    details.value = value;
    persist();
  }

  function saveStep(value: CheckoutStep): void {
    step.value = value;
    persist();
  }

  function clear(): void {
    details.value = null;
    step.value = 1;
    if (typeof localStorage !== "undefined") localStorage.removeItem(CHECKOUT_STORAGE_KEY);
  }

  return { details, step, saveDetails, saveStep, clear };
}
