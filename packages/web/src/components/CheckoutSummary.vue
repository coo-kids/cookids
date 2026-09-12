<script setup lang="ts">
import { formatEuro } from "@cookids/domain/utils/formatEuro";
import { categories } from "../content/catalog.js";
import type { CategoryComposition } from "../composables/useCart.js";
import type { EnrichedCartItem } from "../types/EnrichedCartItem.js";
import QuantitySelector from "./QuantitySelector.vue";

const props = withDefaults(
  defineProps<{
    items: EnrichedCartItem[];
    total: number;
    editable?: boolean;
    categoryCompositions?: CategoryComposition[];
  }>(),
  {
    editable: false,
    categoryCompositions: () => [],
  },
);
defineEmits<{ changeQuantity: [productId: string, quantity: number] }>();

function itemsForCategory(categoryId: string): EnrichedCartItem[] {
  return props.items.filter((item) => item.product.category === categoryId);
}

function categoryComposition(categoryId: string): CategoryComposition | undefined {
  return props.categoryCompositions.find((composition) => composition.categoryId === categoryId);
}
</script>

<template>
  <div class="min-w-0 max-w-full overflow-hidden rounded-2xl border border-[#eadace] bg-white">
    <table class="w-full table-fixed border-collapse text-left sm:table-auto">
      <colgroup>
        <col />
        <col :class="editable ? 'w-30 sm:w-auto' : 'w-16 sm:w-auto'" />
        <col class="w-24 sm:w-auto" />
      </colgroup>
      <thead
        class="bg-[#fff5ec] font-sans text-xs font-bold uppercase tracking-[.08em] text-[#805b4c]"
      >
        <tr>
          <th class="px-2 py-3 sm:px-4">Article</th>
          <th class="px-2 py-3 text-center sm:px-4">Qté</th>
          <th class="px-2 py-3 text-right sm:px-4">Total</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="category in categories.filter((category) => itemsForCategory(category.id).length)" :key="category.id">
          <tr class="border-t border-[#eadace] bg-[#fffaf4]">
            <th class="px-4 py-2.5 text-left font-sans text-sm font-bold" colspan="3" scope="rowgroup">
              <span>{{ category.label }}</span>
              <span
                v-if="categoryComposition(category.id)"
                :class="[
                  'ml-2',
                  categoryComposition(category.id)?.isValid ? 'text-[#695149]' : 'text-[#b3261e]',
                ]"
              >
                {{ categoryComposition(category.id)?.quantity }}/{{ categoryComposition(category.id)?.requiredQuantity }}
                <span v-if="!categoryComposition(category.id)?.isValid"> — complétez votre sélection pour valider la commande.</span>
              </span>
            </th>
          </tr>
          <tr
            v-for="item in itemsForCategory(category.id)"
            :key="item.productId"
            class="border-t border-[#f0dfd1]"
          >
            <td class="break-words px-2 py-3 sm:px-4">
              <div class="flex items-center gap-3">
                <img
                  :src="item.product.image"
                  :alt="item.product.name"
                  class="hidden size-12 shrink-0 rounded-lg object-cover sm:block"
                />
                <div class="min-w-0">
                  <span class="block font-bold">{{ item.product.name }}</span>
                  <span class="text-sm text-[#80685d]"
                    >{{ formatEuro(item.product.price) }} {{ item.product.unitLabel }}</span
                  >
                </div>
              </div>
            </td>
            <td class="px-2 py-3 text-center sm:px-4">
              <QuantitySelector
                v-if="editable"
                class="flex-row gap-0.5 p-0.5 sm:gap-1.5 sm:p-1"
                :quantity="item.quantity"
                @change="$emit('changeQuantity', item.productId, $event)"
              />
              <template v-else>{{ item.quantity }}</template>
            </td>
            <td class="whitespace-nowrap px-2 py-3 text-right text-sm font-bold sm:px-4 sm:text-base">
              {{ formatEuro(item.total) }}
            </td>
          </tr>
        </template>
      </tbody>
      <tfoot class="border-t-2 border-[#eadace] bg-[#fffaf4]">
        <tr>
          <td class="px-2 py-4 font-bold sm:px-4" colspan="2">Total</td>
          <td class="whitespace-nowrap px-2 py-4 text-right text-sm font-bold text-cookids-coral sm:px-4 sm:text-lg">
            {{ formatEuro(total) }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
