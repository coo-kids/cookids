<script setup lang="ts">
import { catalog, categories } from "../content/catalog.js";
import AppButton from "./AppButton.vue";
import ProductCard from "./ProductCard.vue";
import { RouterLink } from "vue-router";

defineProps<{ quantities: Record<string, number> }>();
defineEmits<{ changeQuantity: [productId: string, quantity: number] }>();
</script>

<template>
  <section id="catalogue" class="bg-white py-[4.5rem]" aria-labelledby="catalogue-title">
    <div class="mx-auto w-[calc(100%-2rem)] max-w-[1180px]">
      <div class="mb-8">
        <p class="m-0 font-sans text-[.78rem] font-bold uppercase tracking-[.14em] text-[#b85131]">Le catalogue</p>
        <h2 id="catalogue-title" class="my-2 text-[clamp(2.1rem,5vw,3.8rem)] leading-none tracking-[-.055em] md:whitespace-nowrap">Les gourmandises du moment</h2>
        <p class="max-w-[580px] leading-[1.5]">Les cookies pèsent entre 40 et 42 g crus. Ils sont vendus à l'unité.</p>
      </div>
      <div v-for="category in categories" :key="category.id" class="mt-10 first:mt-0">
        <div class="mb-5">
          <h3 class="m-0 text-2xl tracking-[-.035em]">{{ category.label }}</h3>
          <p v-if="category.quantityMultiple" class="mt-1 text-[#695149]">Composez votre sélection par multiple de {{ category.quantityMultiple }}.</p>
        </div>
        <div class="grid grid-cols-1 gap-[1.35rem] md:grid-cols-2 xl:grid-cols-3">
          <ProductCard
            v-for="product in catalog.filter((product) => product.category === category.id)"
            :key="product.id"
            :product="product"
            :quantity="quantities[product.id] ?? 0"
            @change-quantity="$emit('changeQuantity', product.id, $event)"
          />
        </div>
      </div>
      <div class="mt-10 flex justify-center">
        <AppButton :as="RouterLink" :to="{ name: 'checkout' }">Commander</AppButton>
      </div>
    </div>
  </section>
</template>
