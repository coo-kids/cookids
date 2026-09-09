<script setup lang="ts">
import { ref } from "vue";
import { siteContent } from "../content/site";
import type { EnrichedCartItem } from "../types/EnrichedCartItem";
import type { OrderResponse } from "../types/OrderResponse";
import AppButton from "./AppButton.vue";
import CheckoutSummary from "./CheckoutSummary.vue";
import CheckoutStepper from "./CheckoutStepper.vue";
import OrderForm from "./OrderForm.vue";
import OrderSuccess from "./OrderSuccess.vue";

defineProps<{ items: EnrichedCartItem[]; totalCents: number }>();
const emit = defineEmits<{ backToCatalog: []; changeQuantity: [productId: string, quantity: number]; success: [] }>();
const isFormVisible = ref(false);
const order = ref<OrderResponse | null>(null);

function showOrderForm(): void {
  isFormVisible.value = true;
}

function goToStep(step: 1 | 2): void {
  if (step === 1) {
    isFormVisible.value = false;
  }
}

function changeQuantity(productId: string, quantity: number): void {
  emit("changeQuantity", productId, quantity);
}

function handleSuccess(orderResult: OrderResponse): void {
  order.value = orderResult;
  emit("success");
}
</script>

<template>
  <main class="min-h-[calc(100vh-var(--app-header-height))] bg-[#fffaf4] px-4 py-10 sm:py-16">
    <section class="mx-auto max-w-3xl">
      <template v-if="order">
        <CheckoutStepper :current-step="3" />
        <OrderSuccess :order="order" @close="$emit('backToCatalog')" />
      </template>
      <template v-else>
        <CheckoutStepper :current-step="isFormVisible ? 2 : 1" @go-to-step="goToStep" />
        <p class="font-sans text-sm font-bold uppercase tracking-[.12em] text-cookids-coral">Votre sélection</p>
        <h1 class="mb-8 text-4xl leading-tight sm:text-5xl">{{ siteContent.orderTitle }}</h1>
        <p v-if="items.length === 0" class="rounded-xl bg-white p-5 text-[#695149]">Votre panier est encore vide.</p>
        <template v-else>
          <CheckoutSummary
            :items="items"
            :total-cents="totalCents"
            :editable="!isFormVisible"
            @change-quantity="changeQuantity"
          />
          <div v-if="!isFormVisible" class="mt-8 flex flex-wrap gap-3">
            <AppButton as="a" variant="neutral" href="#catalogue">Continuer mes achats</AppButton>
            <AppButton @click="showOrderForm">Valider mon panier</AppButton>
          </div>
          <OrderForm v-else :items="items" @success="handleSuccess" />
        </template>
      </template>
    </section>
  </main>
</template>
