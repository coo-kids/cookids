<script setup lang="ts">
import { computed } from "vue";
import AppFooter from "./components/AppFooter.vue";
import AppHeader from "./components/AppHeader.vue";
import CartDrawer from "./components/CartDrawer.vue";
import HeroSection from "./components/HeroSection.vue";
import ProductGrid from "./components/ProductGrid.vue";
import { useCart } from "./composables/useCart";

const cart = useCart();
const quantities = computed(() => Object.fromEntries(cart.enrichedItems.value.map((item) => [item.productId, item.quantity])));

function openCart(): void { cart.isCartOpen.value = true; }
function closeCart(): void { cart.isCartOpen.value = false; }
function handleOrderSuccess(): void { cart.clear(); }
</script>

<template>
  <AppHeader :cart-count="cart.count.value" @open-cart="openCart" />
  <main>
    <HeroSection />
    <ProductGrid :quantities="quantities" @change-quantity="cart.setQuantity" />
  </main>
  <CartDrawer :is-open="cart.isCartOpen.value" :items="cart.enrichedItems.value" :total-cents="cart.totalCents.value" @close="closeCart" @change-quantity="cart.setQuantity" @success="handleOrderSuccess" />
  <AppFooter />
</template>
