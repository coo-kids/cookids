<script setup lang="ts">
import { computed } from "vue";
const props = withDefaults(defineProps<{ quantity: number; step?: number; minimum?: number }>(), { step: 1 });
const emit = defineEmits<{ change: [quantity: number] }>();
import AppButton from "./AppButton.vue";

const decreaseAmount = computed(() => props.minimum && props.quantity <= props.minimum ? props.quantity : props.step);
const increaseAmount = computed(() => props.minimum && props.quantity === 0 ? props.minimum : props.step);

function quantityLabel(action: "Ajouter" | "Retirer", amount: number): string {
  return amount === 1 ? `${action} une unité` : `${action} ${amount} unités`;
}

function decrease(): void { emit("change", Math.max(0, props.quantity - decreaseAmount.value)); }
function increase(): void { emit("change", props.quantity + increaseAmount.value); }
</script>

<template>
  <div class="inline-flex items-center gap-1.5 rounded-full bg-[#fff0e5] p-1" aria-label="Quantité">
    <AppButton class="touch-manipulation" variant="dark" size="small" :disabled="quantity === 0" :aria-label="quantityLabel('Retirer', decreaseAmount)" @click="decrease">−</AppButton>
    <output class="min-w-5 text-center font-sans font-bold">{{ quantity }}</output>
    <AppButton class="touch-manipulation" variant="dark" size="small" :disabled="quantity + increaseAmount > 48" :aria-label="quantityLabel('Ajouter', increaseAmount)" @click="increase">+</AppButton>
  </div>
</template>
