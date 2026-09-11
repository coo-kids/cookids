<script setup lang="ts">
import { ref } from "vue";
import { siteContent } from "../content/site.js";
import type { CheckoutDetails } from "../types/CheckoutDetails.js";
import type { EnrichedCartItem } from "../types/EnrichedCartItem.js";
import type { OrderResponse } from "../types/OrderResponse.js";
import AppButton from "./AppButton.vue";
import CheckoutSummary from "./CheckoutSummary.vue";
import CheckoutStepper from "./CheckoutStepper.vue";
import OrderForm from "./OrderForm.vue";
import OrderReview from "./OrderReview.vue";
import OrderSuccess from "./OrderSuccess.vue";

const props = defineProps<{ items: EnrichedCartItem[]; total: number }>();
const emit = defineEmits<{ backToCatalog: []; changeQuantity: [productId: string, quantity: number]; success: [] }>();
const currentStep = ref<1 | 2 | 3 | 4>(1);
const checkoutDetails = ref<CheckoutDetails | null>(null);
const isLoaderPreviewVisible = ref(false);
const isConfirmationPreviewVisible = ref(false);
const order = ref<OrderResponse | null>(null);
const isPreviewMode = import.meta.env.DEV;

function goToStep(step: 1 | 2 | 3): void {
  currentStep.value = step;
  isLoaderPreviewVisible.value = false;
}

function showOrderForm(): void {
  currentStep.value = 2;
}

function reviewOrder(details: CheckoutDetails): void {
  checkoutDetails.value = details;
  currentStep.value = 3;
}

function showConfirmationPreview(): void {
  order.value = {
    id: 0,
    total: props.total,
    deliveryLocation: "preview",
    items: props.items.map((item) => ({
      productName: item.product.name,
      quantity: item.quantity,
      unitLabel: item.product.unitLabel,
      total: item.total
    }))
  };
  currentStep.value = 4;
  isConfirmationPreviewVisible.value = true;
}

function hideConfirmationPreview(): void {
  order.value = null;
  currentStep.value = checkoutDetails.value ? 3 : 1;
  isConfirmationPreviewVisible.value = false;
}

function changeQuantity(productId: string, quantity: number): void {
  emit("changeQuantity", productId, quantity);
}

function handleSuccess(orderResult: OrderResponse): void {
  order.value = orderResult;
  currentStep.value = 4;
  isLoaderPreviewVisible.value = false;
  isConfirmationPreviewVisible.value = false;
  emit("success");
}
</script>

<template>
  <main class="min-h-[calc(100vh-var(--app-header-height))] bg-[#fffaf4] px-4 py-10 sm:py-16">
    <section class="mx-auto max-w-3xl">
      <CheckoutStepper :current-step="currentStep" @go-to-step="goToStep" />

      <div v-if="isPreviewMode" class="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-[#d9c6b8] bg-white/60 p-3 font-sans text-xs text-[#695149]">
        <span class="mr-1 font-bold uppercase tracking-[.08em]">Aperçu</span>
        <button
          v-if="currentStep === 3"
          class="rounded-full border border-[#d9c6b8] bg-white px-3 py-1 font-bold hover:border-cookids-coral hover:text-cookids-coral"
          type="button"
          @click="isLoaderPreviewVisible = !isLoaderPreviewVisible"
        >
          {{ isLoaderPreviewVisible ? "Masquer le loader" : "Voir le loader" }}
        </button>
        <button
          v-if="currentStep < 4"
          class="rounded-full border border-[#d9c6b8] bg-white px-3 py-1 font-bold hover:border-cookids-coral hover:text-cookids-coral"
          type="button"
          @click="showConfirmationPreview"
        >Voir la confirmation</button>
        <button
          v-if="isConfirmationPreviewVisible"
          class="rounded-full border border-[#d9c6b8] bg-white px-3 py-1 font-bold hover:border-cookids-coral hover:text-cookids-coral"
          type="button"
          @click="hideConfirmationPreview"
        >Retour au tunnel</button>
      </div>

      <Transition
        mode="out-in"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-x-4 opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="-translate-x-4 opacity-0"
      >
        <div v-if="currentStep === 1" key="cart">
          <div class="mb-8 flex items-center justify-between gap-6">
            <div>
              <p class="font-sans text-sm font-bold uppercase tracking-[.12em] text-cookids-coral">Votre sélection</p>
              <h1 class="m-0 text-4xl leading-tight sm:text-5xl">{{ siteContent.orderTitle }}</h1>
            </div>
            <img class="relative -top-5 -mb-10 hidden h-[7.5rem] w-auto shrink-0 object-contain opacity-90 lg:block" src="/images/pages/cookids-staked.png" alt="" aria-hidden="true" />
          </div>
          <p v-if="items.length === 0" class="rounded-xl bg-white p-5 text-[#695149]">Votre panier est encore vide.</p>
          <template v-else>
            <CheckoutSummary :items="items" :total="total" editable @change-quantity="changeQuantity" />
            <div class="mt-8 flex flex-wrap gap-3">
              <AppButton as="a" variant="neutral" href="#catalogue">Continuer mes achats</AppButton>
              <AppButton @click="showOrderForm">Valider mon panier</AppButton>
            </div>
          </template>
        </div>

        <div v-else-if="currentStep === 2" key="details">
          <div class="mb-8 flex items-center justify-between gap-6">
            <div>
              <p class="font-sans text-sm font-bold uppercase tracking-[.12em] text-cookids-coral">Étape 2 sur 4</p>
              <h1 class="m-0 text-4xl leading-tight sm:text-5xl">Vos coordonnées</h1>
            </div>
            <img class="relative -top-5 -mb-10 hidden h-[7.5rem] w-auto shrink-0 object-contain opacity-90 lg:block" src="/images/pages/cookids-staked.png" alt="" aria-hidden="true" />
          </div>
          <OrderForm :initial-values="checkoutDetails ?? undefined" :show-title="false" @submit="reviewOrder" />
        </div>

        <OrderReview
          v-else-if="currentStep === 3 && checkoutDetails"
          key="review"
          :details="checkoutDetails"
          :items="items"
          :total="total"
          :is-loading-preview="isLoaderPreviewVisible"
          @success="handleSuccess"
        />

        <OrderSuccess
          v-else-if="currentStep === 4 && order"
          key="confirmation"
          :order="order"
          @close="$emit('backToCatalog')"
        />
      </Transition>
    </section>
  </main>
</template>
