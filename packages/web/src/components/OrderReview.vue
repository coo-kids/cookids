<script setup lang="ts">
import { computed, ref } from "vue";
import { locations } from "../content/locations.js";
import type { CheckoutDetails } from "../types/CheckoutDetails.js";
import type { EnrichedCartItem } from "../types/EnrichedCartItem.js";
import type { OrderResponse } from "../types/OrderResponse.js";
import AppButton from "./AppButton.vue";
import CheckoutSummary from "./CheckoutSummary.vue";

const props = defineProps<{
  details: CheckoutDetails;
  items: EnrichedCartItem[];
  total: number;
  isLoadingPreview?: boolean;
}>();
const emit = defineEmits<{ success: [order: OrderResponse] }>();

const errorMessage = ref("");
const isSubmitting = ref(false);
const isLoading = computed(() => isSubmitting.value || props.isLoadingPreview === true);
const deliveryLocationLabel = computed(
  () => locations.find((location) => location.id === props.details.deliveryLocation)?.label ?? props.details.deliveryLocation
);

function formatDeliveryDate(date: string | undefined): string {
  if (!date) return "Non renseignée";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00.000Z`));
}

async function submitOrder(): Promise<void> {
  if (isLoading.value || props.items.length === 0) return;
  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          firstName: props.details.firstName,
          lastName: props.details.lastName,
          email: props.details.email,
          phoneNumber: props.details.phoneNumber
        },
        deliveryLocation: props.details.deliveryLocation,
        targetDeliveryDate: props.details.targetDeliveryDate
          ? new Date(`${props.details.targetDeliveryDate}T00:00:00.000Z`).toISOString()
          : undefined,
        items: props.items.map(({ productId, quantity }) => ({ productId, quantity }))
      })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message ?? "La commande n'a pas pu être envoyée.");
    emit("success", payload.order as OrderResponse);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "La commande n'a pas pu être envoyée.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <section class="relative" :aria-busy="isLoading">
    <div class="mb-8 flex items-center justify-between gap-6">
      <div>
        <p class="font-sans text-sm font-bold uppercase tracking-[.12em] text-cookids-coral">Étape 3 sur 4</p>
        <h1 class="m-0 text-4xl leading-tight sm:text-5xl">Récapitulatif</h1>
      </div>
      <img class="relative -top-5 -mb-10 hidden h-[7.5rem] w-auto shrink-0 object-contain opacity-90 lg:block" src="/images/pages/cookids-staked.png" alt="" aria-hidden="true" />
    </div>

    <section aria-labelledby="order-summary-title">
      <h2 id="order-summary-title" class="text-[1.7rem]">Votre commande</h2>
      <CheckoutSummary :items="items" :total="total" />
    </section>

    <section class="mt-10" aria-labelledby="customer-summary-title">
      <h2 id="customer-summary-title" class="text-[1.7rem]">Vos coordonnées</h2>
      <dl class="grid gap-x-8 gap-y-4 rounded-2xl border border-[#eadace] bg-white p-5 sm:grid-cols-2">
        <div><dt class="font-sans text-xs font-bold uppercase tracking-[.08em] text-[#80685d]">Prénom</dt><dd class="m-0 mt-1">{{ details.firstName }}</dd></div>
        <div><dt class="font-sans text-xs font-bold uppercase tracking-[.08em] text-[#80685d]">Nom</dt><dd class="m-0 mt-1">{{ details.lastName || "Non renseigné" }}</dd></div>
        <div><dt class="font-sans text-xs font-bold uppercase tracking-[.08em] text-[#80685d]">Email</dt><dd class="m-0 mt-1 break-all">{{ details.email }}</dd></div>
        <div><dt class="font-sans text-xs font-bold uppercase tracking-[.08em] text-[#80685d]">Téléphone</dt><dd class="m-0 mt-1">{{ details.phoneNumber || "Non renseigné" }}</dd></div>
        <div><dt class="font-sans text-xs font-bold uppercase tracking-[.08em] text-[#80685d]">Lieu de livraison</dt><dd class="m-0 mt-1">{{ deliveryLocationLabel }}</dd></div>
        <div><dt class="font-sans text-xs font-bold uppercase tracking-[.08em] text-[#80685d]">Date souhaitée</dt><dd class="m-0 mt-1">{{ formatDeliveryDate(details.targetDeliveryDate) }}</dd></div>
      </dl>
    </section>

    <p v-if="errorMessage" class="font-sans text-[.9rem] font-bold text-[#b3261e]" role="alert">{{ errorMessage }}</p>
    <AppButton class="mt-8 w-full disabled:cursor-wait" :disabled="isLoading || items.length === 0" @click="submitOrder">
      {{ isLoading ? "Envoi en cours…" : "Valider la commande" }}
    </AppButton>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isLoading" class="absolute inset-0 z-10 flex min-h-full items-center justify-center rounded-xl bg-[#fffaf4]/92 px-6 text-center backdrop-blur-sm" role="status" aria-live="polite">
        <div class="flex max-w-xs flex-col items-center gap-4">
          <img class="h-56 w-auto animate-[bounce_3s_ease-in-out_infinite] object-contain" src="/images/pages/cookids-cook.png" alt="" aria-hidden="true" />
          <p class="font-sans text-base font-bold text-cookids-ink">Nous enregistrons votre commande</p>
          <span class="size-10 animate-spin rounded-full border-4 border-cookids-coral/25 border-t-cookids-coral" aria-hidden="true" />
        </div>
      </div>
    </Transition>
  </section>
</template>
