<script setup lang="ts">
import ProductGrid from "../components/ProductGrid.vue";
import HeroSection from "../components/HeroSection.vue";
import { computed, nextTick, ref } from "vue";
import { useRouter } from "vue-router";
import { useCart } from "../composables/useCart.js";
import { useCheckoutDraft } from "../composables/useCheckoutDraft.js";
import GroupOrderControls from "../components/GroupOrderControls.vue";

const cart = useCart();
const checkoutDraft = useCheckoutDraft();
const router = useRouter();
const showCompositionErrors = ref(false);
const quantities = computed(() => Object.fromEntries(cart.activeItems.value.map((item) => [item.productId, item.quantity])));

function clearCart(): void {
  cart.clear();
  checkoutDraft.clear();
  showCompositionErrors.value = false;
}

async function goToCheckout(): Promise<void> {
  if (!cart.hasValidParticipantLabels.value) {
    document.getElementById("order-mode-title")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
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
  <GroupOrderControls
    :is-grouped="cart.isGrouped.value"
    :participants="cart.participants.value"
    :active-participant-id="cart.activeParticipantId.value"
    @enable="cart.enableGroupedOrder"
    @disable="cart.disableGroupedOrder"
    @add-participant="cart.addParticipant"
    @remove-participant="cart.removeParticipant"
    @select-participant="cart.activeParticipantId.value = $event"
    @update-label="cart.updateParticipantLabel"
  />
  <ProductGrid
    :quantities="quantities"
    :category-compositions="cart.categoryCompositions.value"
    :minimum-compositions="cart.minimumCompositions.value"
    :is-composition-valid="cart.isCompositionValid.value"
    :show-composition-errors="showCompositionErrors"
    :has-items="cart.count.value > 0"
    :participant-labels-valid="cart.hasValidParticipantLabels.value"
    :grouped="cart.isGrouped.value"
    :active-participant-label="cart.activeParticipant.value?.label"
    @change-quantity="cart.setQuantity"
    @add-customized-product="cart.addCustomizedProduct"
    @clear-cart="clearCart"
    @go-to-checkout="goToCheckout"
  />
</template>
