<script setup lang="ts">
import { formatEuro } from "@cookids/domain/utils/formatEuro";
import type { EnrichedCartItem } from "../types/EnrichedCartItem";
import QuantitySelector from "./QuantitySelector.vue";

withDefaults(
  defineProps<{
    items: EnrichedCartItem[];
    totalCents: number;
    editable?: boolean;
  }>(),
  {
    editable: false,
  },
);
defineEmits<{ changeQuantity: [productId: string, quantity: number] }>();
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-[#eadace] bg-white">
    <table class="w-full border-collapse text-left">
      <thead
        class="bg-[#fff5ec] font-sans text-xs font-bold uppercase tracking-[.08em] text-[#805b4c]"
      >
        <tr>
          <th class="px-4 py-3">Article</th>
          <th class="px-4 py-3 text-center">Qté</th>
          <th class="px-4 py-3 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in items"
          :key="item.productId"
          class="border-t border-[#f0dfd1]"
        >
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <img
                :src="item.product.image"
                :alt="item.product.name"
                class="size-12 shrink-0 rounded-lg object-cover"
              />
              <div>
                <span class="block font-bold">{{ item.product.name }}</span>
                <span class="text-sm text-[#80685d]"
                  >{{ formatEuro(item.product.price) }} l'unité</span
                >
              </div>
            </div>
          </td>
          <td class="px-4 py-3 text-center">
            <QuantitySelector
              v-if="editable"
              :quantity="item.quantity"
              @change="$emit('changeQuantity', item.productId, $event)"
            />
            <template v-else>{{ item.quantity }}</template>
          </td>
          <td class="px-4 py-3 text-right font-bold">
            {{ formatEuro(item.totalCents) }}
          </td>
        </tr>
      </tbody>
      <tfoot class="border-t-2 border-[#eadace] bg-[#fffaf4]">
        <tr>
          <td class="px-4 py-4 font-bold" colspan="2">Total</td>
          <td class="px-4 py-4 text-right text-lg font-bold text-cookids-coral">
            {{ formatEuro(totalCents) }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
