<script setup lang="ts">
import { X } from "lucide-vue-next";
import { formatEuro } from "@cookids/domain/utils/formatEuro";
import type { EnrichedCartItem } from "../types/EnrichedCartItem.js";
import AppButton from "./AppButton.vue";
import CartItemRow from "./CartItem.vue";

defineProps<{ isOpen: boolean; items: EnrichedCartItem[]; total: number }>();
defineEmits<{ close: []; changeQuantity: [productId: string, quantity: number]; checkout: [] }>();
</script>

<template>
  <Transition enter-active-class="transition-opacity duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <button v-if="isOpen" class="fixed right-0 bottom-0 left-0 top-[var(--app-header-height)] z-0 cursor-default bg-cookids-ink/10 backdrop-blur-[1px]" type="button" tabindex="-1" aria-label="Fermer le panier" @click="$emit('close')" />
  </Transition>
  <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="translate-x-full" enter-to-class="translate-x-0" leave-active-class="transition duration-200 ease-in" leave-from-class="translate-x-0" leave-to-class="translate-x-full">
    <aside v-if="isOpen" id="cart-drawer" class="fixed right-0 top-[var(--app-header-height)] bottom-0 z-10 w-full max-w-[470px] overflow-y-auto bg-[#fffaf4] p-[1.4rem] shadow-[-18px_0_60px_rgba(47,33,27,.23)]" aria-label="Votre panier">
      <div class="flex items-center justify-between"><h2 class="m-0 text-[2rem]">Votre panier</h2><AppButton variant="neutral" size="small" aria-label="Fermer le panier" @click="$emit('close')"><X :size="20" aria-hidden="true" /></AppButton></div>
      <p v-if="items.length === 0" class="text-[#695149]">Votre panier est encore vide.</p>
      <template v-else>
        <ul class="list-none p-0"><CartItemRow v-for="item in items" :key="item.productId" v-bind="item" @change-quantity="$emit('changeQuantity', item.productId, $event)" /></ul>
        <p class="flex justify-between border-t border-[#eadace] py-4 text-[1.2rem]"><span>Total</span><strong>{{ formatEuro(total) }}</strong></p>
        <AppButton class="w-full" @click="$emit('checkout')">Passer la commande</AppButton>
      </template>
    </aside>
  </Transition>
</template>
