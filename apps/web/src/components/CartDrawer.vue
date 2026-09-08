<script setup lang="ts">
import { ref } from "vue";
import type { CartItem } from "@cookids/domain/models/CartItem";
import type { Product } from "@cookids/domain/models/Product";
import { formatEuro } from "@cookids/domain/utils/formatEuro";
import CartItemRow from "./CartItem.vue";
import OrderForm from "./OrderForm.vue";
import OrderSuccess from "./OrderSuccess.vue";

interface EnrichedItem extends CartItem { product: Product; totalCents: number; }
interface OrderResult { id: string; totalCents: number; items: Array<{ productName: string; quantity: number; totalCents: number }>; }

const props = defineProps<{ isOpen: boolean; items: EnrichedItem[]; totalCents: number }>();
const emit = defineEmits<{ close: []; changeQuantity: [productId: string, quantity: number]; success: [] }>();
const order = ref<OrderResult | null>(null);

function closeAfterSuccess(): void { emit("success"); emit("close"); }
</script>

<template>
  <aside v-if="isOpen" class="fixed inset-y-0 right-0 z-10 w-full max-w-[470px] overflow-y-auto bg-[#fffaf4] p-[1.4rem] shadow-[-18px_0_60px_rgba(47,33,27,.23)]" aria-label="Votre panier">
    <div class="flex items-center justify-between"><h2 class="m-0 text-[2rem]">Votre panier</h2><button class="rounded-full bg-transparent text-[2.2rem] leading-none transition-colors hover:bg-[#f4e8dc]" type="button" aria-label="Fermer le panier" @click="$emit('close')">×</button></div>
    <template v-if="!order">
      <p v-if="items.length === 0" class="text-[#695149]">Votre panier est encore vide.</p>
      <ul v-else class="list-none p-0"><CartItemRow v-for="item in items" :key="item.productId" v-bind="item" @change-quantity="$emit('changeQuantity', item.productId, $event)" /></ul>
      <p v-if="items.length" class="flex justify-between border-t border-[#eadace] py-4 text-[1.2rem]"><span>Total</span><strong>{{ formatEuro(totalCents) }}</strong></p>
      <OrderForm v-if="items.length" :items="items" @success="order = $event" />
    </template>
    <OrderSuccess v-else :order="order" @close="closeAfterSuccess" />
  </aside>
</template>
