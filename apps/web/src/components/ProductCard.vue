<script setup lang="ts">
import type { Product } from "@cookids/domain/models/Product";
import { formatEuro } from "@cookids/domain/utils/formatEuro";
import QuantitySelector from "./QuantitySelector.vue";

defineProps<{ product: Product; quantity: number }>();
defineEmits<{ changeQuantity: [quantity: number] }>();
</script>

<template>
  <article
    class="overflow-hidden rounded-[1.25rem] bg-white shadow-[0_8px_30px_rgba(76,44,25,.08)]"
  >
    <img
      class="block h-[250px] w-full object-cover max-md:h-[290px]"
      :src="product.image"
      :alt="product.name"
    />
    <div class="p-[1.2rem]">
      <div class="flex items-start justify-between gap-3">
        <h3 class="m-0 text-[1.35rem] leading-[1.1]">{{ product.name }}</h3>
        <strong class="whitespace-nowrap text-[#b85131]">{{
          formatEuro(product.price)
        }}</strong>
      </div>
      <p class="min-h-10 leading-[1.35] text-[#695149]">
        {{ product.description }}
      </p>
      <div class="mt-4 flex w-full items-center justify-between gap-4">
        <small>{{ product.unitLabel }}</small>
        <QuantitySelector
          :quantity="quantity"
          @change="$emit('changeQuantity', $event)"
        />
      </div>
    </div>
  </article>
</template>
