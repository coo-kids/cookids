<script setup lang="ts">
const props = withDefaults(defineProps<{ quantity: number; step?: number }>(), { step: 1 });
const emit = defineEmits<{ change: [quantity: number] }>();
import AppButton from "./AppButton.vue";

function decrease(): void { emit("change", Math.max(0, props.quantity - props.step)); }
function increase(): void { emit("change", props.quantity + props.step); }
</script>

<template>
  <div class="inline-flex items-center gap-1.5 rounded-full bg-[#fff0e5] p-1" aria-label="Quantité">
    <AppButton class="touch-manipulation" variant="dark" size="small" :disabled="quantity === 0" :aria-label="step === 1 ? 'Retirer une unité' : `Retirer ${step} unités`" @click="decrease">−</AppButton>
    <output class="min-w-5 text-center font-sans font-bold">{{ quantity }}</output>
    <AppButton class="touch-manipulation" variant="dark" size="small" :disabled="quantity + step > 48" :aria-label="step === 1 ? 'Ajouter une unité' : `Ajouter ${step} unités`" @click="increase">+</AppButton>
  </div>
</template>
