<script setup lang="ts">
import ProductGrid from "../components/ProductGrid.vue";
import HeroSection from "../components/HeroSection.vue";
import { computed, nextTick, ref } from "vue";
import { useRouter } from "vue-router";
import { useCart } from "../composables/useCart.js";

const cart = useCart();
const router = useRouter();
const showCompositionErrors = ref(false);
const quantities = computed(() => Object.fromEntries(cart.enrichedItems.value.map((item) => [item.productId, item.quantity])));

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
    @change-quantity="cart.setQuantity"
    @go-to-checkout="goToCheckout"
  />
</template>
