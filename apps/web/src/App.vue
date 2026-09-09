<script setup lang="ts">
import { computed } from "vue";
import AppFooter from "./components/AppFooter.vue";
import AppHeader from "./components/AppHeader.vue";
import CartDrawer from "./components/CartDrawer.vue";
import CheckoutPage from "./components/CheckoutPage.vue";
import HeroSection from "./components/HeroSection.vue";
import ProductGrid from "./components/ProductGrid.vue";
import { useCart } from "./composables/useCart";
import { useCheckoutRoute } from "./composables/useCheckoutRoute";

const cart = useCart();
const checkoutRoute = useCheckoutRoute();
const quantities = computed(() => Object.fromEntries(cart.enrichedItems.value.map((item) => [item.productId, item.quantity])));

function toggleCart(): void { cart.isCartOpen.value = !cart.isCartOpen.value; }
function closeCart(): void { cart.isCartOpen.value = false; }
function handleOrderSuccess(): void { cart.clear(); }
function openCheckout(): void { closeCart(); checkoutRoute.openCheckout(); }
function returnToCatalog(): void { checkoutRoute.closeCheckout(); }
</script>

<template>
  <div class="[--app-header-height:5rem]">
    <AppHeader :cart-count="cart.count.value" :is-cart-open="cart.isCartOpen.value" @toggle-cart="toggleCart" />
    <CheckoutPage v-if="checkoutRoute.isCheckout.value" :items="cart.enrichedItems.value" :total-cents="cart.totalCents.value" @change-quantity="cart.setQuantity" @success="handleOrderSuccess" @back-to-catalog="returnToCatalog" />
    <main v-else>
      <HeroSection />
      <ProductGrid :quantities="quantities" @change-quantity="cart.setQuantity" />
    </main>
    <CartDrawer v-if="!checkoutRoute.isCheckout.value" :is-open="cart.isCartOpen.value" :items="cart.enrichedItems.value" :total-cents="cart.totalCents.value" @close="closeCart" @change-quantity="cart.setQuantity" @checkout="openCheckout" />
    <AppFooter v-if="!checkoutRoute.isCheckout.value" />
  </div>
</template>
