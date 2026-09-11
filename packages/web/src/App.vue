<script setup lang="ts">
import { computed } from "vue";
import AppFooter from "./components/AppFooter.vue";
import AppHeader from "./components/AppHeader.vue";
import CheckoutPage from "./components/CheckoutPage.vue";
import HeroSection from "./components/HeroSection.vue";
import ProductGrid from "./components/ProductGrid.vue";
import { useCart } from "./composables/useCart.js";
import { useCheckoutRoute } from "./composables/useCheckoutRoute.js";

const cart = useCart();
const checkoutRoute = useCheckoutRoute();
const quantities = computed(() => Object.fromEntries(cart.enrichedItems.value.map((item) => [item.productId, item.quantity])));

function handleOrderSuccess(): void { cart.clear(); }
function returnToCatalog(): void { checkoutRoute.closeCheckout(); }
</script>

<template>
  <div class="[--app-header-height:5rem]">
    <AppHeader :cart-count="cart.count.value" />
    <CheckoutPage v-if="checkoutRoute.isCheckout.value" :items="cart.enrichedItems.value" :total="cart.total.value" @change-quantity="cart.setQuantity" @success="handleOrderSuccess" @back-to-catalog="returnToCatalog" />
    <main v-else>
      <HeroSection />
      <ProductGrid :quantities="quantities" @change-quantity="cart.setQuantity" />
    </main>
    <AppFooter v-if="!checkoutRoute.isCheckout.value" />
  </div>
</template>
