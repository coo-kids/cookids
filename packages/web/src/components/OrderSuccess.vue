<script setup lang="ts">
import type { OrderResponse } from "../types/OrderResponse.js";
import type { EnrichedCartItem } from "../types/EnrichedCartItem.js";
import CheckoutSummary from "./CheckoutSummary.vue";

const props = defineProps<{ order: OrderResponse; items: EnrichedCartItem[] }>();
defineEmits<{ close: [] }>();

function formatOrderNumber(orderId: number): string {
  return `CKIDS-${orderId.toString().padStart(5, "0")}`;
}
</script>

<template>
  <section class="mt-8" aria-live="polite">
    <div class="mb-8 flex items-center justify-between gap-6">
      <div>
        <p class="m-0 font-sans text-[.78rem] font-bold uppercase tracking-[.14em] text-[#b85131]">Merci !</p>
        <h2 class="mb-0 mt-2 text-[2.2rem] leading-none">Ta commande est bien reçue.</h2>
      </div>
      <img class="hidden h-32 w-auto shrink-0 object-contain lg:block" src="/images/pages/cookids-thanks.png" alt="" aria-hidden="true" />
    </div>
    <CheckoutSummary :items="items" :total="order.total" />
    <div class="my-8 text-center">
      <p class="m-0 font-sans text-lg font-bold text-cookids-ink">
        Votre numéro de commande : {{ formatOrderNumber(props.order.id) }}
      </p>
      <p class="mx-auto mt-3 max-w-lg font-sans text-[.95rem] leading-relaxed text-[#695149]">
        Vous recevrez dans votre boîte mail les informations sur l’état d’avancement de votre commande.
      </p>
    </div>
    <button class="w-full rounded-full bg-cookids-coral px-[1.35rem] py-[.9rem] font-bold text-white transition-colors hover:bg-[#bd4f2f]" type="button" @click="$emit('close')">Retour au catalogue</button>
  </section>
</template>
