<script setup lang="ts">
import type { OrderResponse } from "../types/OrderResponse.js";
import AppButton from "./AppButton.vue";

const props = defineProps<{ order: OrderResponse }>();
defineEmits<{ close: [] }>();

function formatOrderNumber(orderId: number | undefined): string {
  return `CKIDS-${(orderId ?? 0).toString().padStart(5, "0")}`;
}
</script>

<template>
  <section class="mt-8" aria-live="polite">
    <div class="mb-8 flex items-center justify-between gap-6">
      <div>
        <p class="m-0 font-sans text-[.78rem] font-bold uppercase tracking-[.14em] text-[#b85131]">Merci !</p>
        <h1 class="mb-0 mt-2 text-[2.2rem] leading-none">Ta commande est bien reçue.</h1>
      </div>
      <img class="hidden h-32 w-auto shrink-0 object-contain lg:block" src="/images/pages/cookids-thanks.png" alt="" aria-hidden="true" />
    </div>
    <div class="my-8 text-center">
      <p class="m-0 font-sans text-lg font-bold text-cookids-ink">
        Votre numéro de commande : {{ formatOrderNumber(props.order.id) }}
      </p>
      <p class="mx-auto mt-3 max-w-lg font-sans text-[.95rem] leading-relaxed text-[#695149]">
        Vous recevrez dans votre boîte mail les informations sur l’état d’avancement de votre commande.
      </p>
    </div>
    <AppButton class="w-full" @click="$emit('close')">Retour au catalogue</AppButton>
  </section>
</template>
