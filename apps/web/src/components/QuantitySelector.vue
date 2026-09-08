<script setup lang="ts">
const props = defineProps<{ quantity: number }>();
const emit = defineEmits<{ change: [quantity: number] }>();
import AppButton from "./AppButton.vue";

function decrease(): void { emit("change", props.quantity - 1); }
function increase(): void { emit("change", props.quantity + 1); }
</script>

<template>
  <div class="inline-flex items-center gap-1.5 rounded-full bg-[#fff0e5] p-1" aria-label="Quantité">
    <AppButton variant="dark" size="small" :disabled="quantity === 0" aria-label="Retirer une unité" @click="decrease">−</AppButton>
    <output class="min-w-5 text-center font-sans font-bold">{{ quantity }}</output>
    <AppButton variant="dark" size="small" :disabled="quantity >= 48" aria-label="Ajouter une unité" @click="increase">+</AppButton>
  </div>
</template>
