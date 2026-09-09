<script setup lang="ts">
import { formatEuro } from "@cookids/domain/utils/formatEuro";
import type { OrderResponse } from "../types/OrderResponse.js";

defineProps<{ order: OrderResponse }>();
defineEmits<{ close: [] }>();
</script>

<template>
  <section class="mt-8" aria-live="polite">
    <p class="m-0 font-sans text-[.78rem] font-bold uppercase tracking-[.14em] text-[#b85131]">Merci !</p>
    <h2 class="text-[2.2rem] leading-none">Ta commande est bien reçue.</h2>
    <ul class="list-none p-0">
      <li v-for="item in order.items" :key="item.productName" class="flex justify-between gap-4 py-[.6rem]"><span>{{ item.quantity }} × {{ item.productName }}</span><strong>{{ formatEuro(item.total) }}</strong></li>
    </ul>
    <p class="flex justify-between border-t border-[#eadace] py-4 text-[1.2rem]"><span>Total</span><strong>{{ formatEuro(order.total) }}</strong></p>
    <p class="font-sans text-[.9rem] text-[#695149]">Commande : #{{ order.id }}</p>
    <button class="w-full rounded-full bg-cookids-coral px-[1.35rem] py-[.9rem] font-bold text-white transition-colors hover:bg-[#bd4f2f]" type="button" @click="$emit('close')">Retour au catalogue</button>
  </section>
</template>
