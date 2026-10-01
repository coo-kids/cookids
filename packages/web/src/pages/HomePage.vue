<script setup lang="ts">
import ProductGrid from "../components/ProductGrid.vue";
import HeroSection from "../components/HeroSection.vue";
import { computed, nextTick, ref } from "vue";
import { useRouter } from "vue-router";
import { useCart } from "../composables/useCart.js";
import { useCheckoutDraft } from "../composables/useCheckoutDraft.js";

const cart = useCart();
const checkoutDraft = useCheckoutDraft();
const router = useRouter();
const showCompositionErrors = ref(false);
const quantities = computed(() => Object.fromEntries(cart.enrichedItems.value.map((item) => [item.productId, item.quantity])));

function clearCart(): void {
  cart.clear();
  checkoutDraft.clear();
  showCompositionErrors.value = false;
}

async function goToCheckout(): Promise<void> {
  if (!cart.isCompositionValid.value) {
    showCompositionErrors.value = true;
    const invalidComposition = cart.categoryCompositions.value.find(
      (composition) => !composition.isValid,
    );
    await nextTick();
    document.getElementById(`category-${invalidComposition?.categoryId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    return;
  }

  router.push({ name: "checkout" });
}

</script>
<template>
  <HeroSection/>
  <ProductGrid
    :quantities="quantities"
    :category-compositions="cart.categoryCompositions.value"
    :is-composition-valid="cart.isCompositionValid.value"
    :show-composition-errors="showCompositionErrors"
    :has-items="cart.count.value > 0"
    @change-quantity="cart.setQuantity"
    @add-customized-product="cart.addCustomizedProduct"
    @clear-cart="clearCart"
    @go-to-checkout="goToCheckout"
  />
</template>
