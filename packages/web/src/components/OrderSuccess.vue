<script setup lang="ts">
import type { OrderResponse } from "../types/OrderResponse.js";
import type { EnrichedCartItem } from "../types/EnrichedCartItem.js";
import CheckoutSummary from "./CheckoutSummary.vue";

defineProps<{ order: OrderResponse; items: EnrichedCartItem[] }>();
defineEmits<{ close: [] }>();
</script>

<template>
  <section class="mt-8" aria-live="polite">
    <p class="m-0 font-sans text-[.78rem] font-bold uppercase tracking-[.14em] text-[#b85131]">Merci !</p>
    <h2 class="text-[2.2rem] leading-none">Ta commande est bien reçue.</h2>
    <CheckoutSummary :items="items" :total="order.total" />
    <p class="font-sans text-[.9rem] text-[#695149]">Commande : #{{ order.id }}</p>
    <button class="w-full rounded-full bg-cookids-coral px-[1.35rem] py-[.9rem] font-bold text-white transition-colors hover:bg-[#bd4f2f]" type="button" @click="$emit('close')">Retour au catalogue</button>
  </section>
</template>
