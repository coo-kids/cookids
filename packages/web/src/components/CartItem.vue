<script setup lang="ts">
import type { Product } from "@cookids/domain/models/Product";
import { formatEuro } from "@cookids/domain/utils/formatEuro";
import QuantitySelector from "./QuantitySelector.vue";

defineProps<{ product: Product; quantity: number; total: number }>();
defineEmits<{ changeQuantity: [quantity: number] }>();
</script>

<template>
  <li class="my-4 flex gap-4">
    <img class="size-20 rounded-xl object-cover" :src="product.image" alt="" />
    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-3">
        <h3 class="m-0 text-xl leading-tight">{{ product.name }}</h3>
        <p class="m-0 shrink-0 font-bold">{{ formatEuro(total) }}</p>
      </div>
      <div class="mt-3 flex justify-end">
        <QuantitySelector :quantity="quantity" @change="$emit('changeQuantity', $event)" />
      </div>
      <p class="mt-2 text-sm text-[#80685d]">{{ product.unitLabel }}</p>
    </div>
  </li>
</template>
