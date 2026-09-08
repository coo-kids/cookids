<script setup lang="ts">
import type { Product } from "@cookids/domain/models/Product";
import { formatEuro } from "@cookids/domain/utils/formatEuro";
import QuantitySelector from "./QuantitySelector.vue";

defineProps<{ product: Product; quantity: number; totalCents: number }>();
defineEmits<{ changeQuantity: [quantity: number] }>();
</script>

<template>
  <li class="my-4 flex gap-4">
    <img class="size-20 rounded-xl object-cover" :src="product.image" alt="" />
    <div>
      <h3 class="mb-[.3rem] text-xl leading-tight">{{ product.name }}</h3>
      <p class="mb-[.3rem]">{{ formatEuro(totalCents) }}</p>
      <QuantitySelector :quantity="quantity" @change="$emit('changeQuantity', $event)" />
    </div>
  </li>
</template>
