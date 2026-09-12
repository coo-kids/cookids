<script setup lang="ts">
import ProductGrid from "../components/ProductGrid.vue";
import HeroSection from "../components/HeroSection.vue";
import { computed } from "vue";
import { useCart } from "../composables/useCart.js";

const cart = useCart();
const quantities = computed(() => Object.fromEntries(cart.enrichedItems.value.map((item) => [item.productId, item.quantity])));

</script>
<template>
  <HeroSection/>
  <ProductGrid :quantities="quantities" @change-quantity="cart.setQuantity"/>
</template>