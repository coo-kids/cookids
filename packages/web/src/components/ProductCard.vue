<script setup lang="ts">
import type { Product } from "@cookids/domain/models/Product";
import { formatEuro } from "@cookids/domain/utils/formatEuro";
import QuantitySelector from "./QuantitySelector.vue";

withDefaults(defineProps<{ product: Product; quantity: number; enforceMinimum?: boolean }>(), { enforceMinimum: true });
defineEmits<{ changeQuantity: [quantity: number] }>();
</script>

<template>
  <article
    class="overflow-hidden rounded-[1.25rem] bg-white shadow-[0_8px_30px_rgba(76,44,25,.08)]"
  >
    <div class="relative overflow-hidden">
      <img
        class="block h-[250px] w-full object-cover max-md:h-[290px]"
        :src="product.image"
        :alt="product.name"
      />
      <span
        v-if="product.is_limited_edition === true"
        class="pointer-events-none absolute right-[-3.5rem] top-10 w-60 rotate-45 bg-[#facc15] py-2 text-center font-sans text-sm font-bold text-cookids-ink shadow-md"
      >Édition limitée</span>
    </div>

    <div class="p-[1.2rem]">
      <div class="flex items-start justify-between gap-3">
        <h3 class="m-0 text-[1.35rem] leading-[1.1]">
          {{ product.name }}<template v-if="product.minimumQuantity"> (minimum {{ product.minimumQuantity }})</template><template v-else-if="product.quantityMultiple"> (x {{ product.quantityMultiple }})</template>
        </h3>
        <strong class="whitespace-nowrap text-[#b85131]">
          {{ formatEuro(product.price) }}
        </strong>
      </div>

      <p class="mt-5 leading-[1.5] text-[#695149]">
        <template
          v-for="(ingredient, index) in product.ingredients"
          :key="ingredient.label"
        >
          <strong v-if="ingredient.is_allergen" class="font-bold">
            {{ ingredient.label }}
          </strong>
          <span v-else>
            {{ ingredient.label }}
          </span>
          <span v-if="index < product.ingredients.length - 1">, </span>
        </template>
      </p>

      <div :class="['mt-4 flex w-full items-center gap-4', product.quantityMultiple || product.minimumQuantity || product.unitLabel === '1 unité' ? 'justify-end' : 'justify-between']">
        <small v-if="!product.quantityMultiple && !product.minimumQuantity && product.unitLabel !== '1 unité'">{{ product.unitLabel }}</small>
        <QuantitySelector
          :quantity="quantity"
          :step="product.quantityMultiple ?? 1"
          :minimum="enforceMinimum ? product.minimumQuantity : undefined"
          @change="$emit('changeQuantity', $event)"
        />
      </div>
    </div>
  </article>
</template>
