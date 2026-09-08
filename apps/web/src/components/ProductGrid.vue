<script setup lang="ts">
import { catalog } from "../content/catalog";
import ProductCard from "./ProductCard.vue";

defineProps<{ quantities: Record<string, number> }>();
defineEmits<{ changeQuantity: [productId: string, quantity: number] }>();
</script>

<template>
  <section id="catalogue" class="bg-white py-[4.5rem]" aria-labelledby="catalogue-title">
    <div class="mx-auto w-[calc(100%-2rem)] max-w-[1180px]">
      <div class="mb-8 max-w-[580px]">
        <p class="m-0 font-sans text-[.78rem] font-bold uppercase tracking-[.14em] text-[#b85131]">Le catalogue</p>
        <h2 id="catalogue-title" class="my-2 text-[clamp(2.1rem,5vw,3.8rem)] leading-none tracking-[-.055em]">Les gourmandises du moment</h2>
        <p class="leading-[1.5]">Les cookies pèsent entre 40 et 42 g crus. Ils sont vendus à l'unité.</p>
      </div>
      <div class="grid grid-cols-1 gap-[1.35rem] md:grid-cols-2 xl:grid-cols-3">
        <ProductCard
          v-for="product in catalog"
          :key="product.id"
          :product="product"
          :quantity="quantities[product.id] ?? 0"
          @change-quantity="$emit('changeQuantity', product.id, $event)"
        />
      </div>
    </div>
  </section>
</template>
