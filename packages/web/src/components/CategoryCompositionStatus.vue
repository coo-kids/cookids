<script setup lang="ts">
import type { CategoryComposition } from "../composables/useCart.js";

withDefaults(defineProps<{
  compositions?: CategoryComposition[];
  compact?: boolean;
}>(), {
  compositions: () => [],
  compact: false,
});
</script>

<template>
  <div
    v-if="compositions.length"
    :class="compact ? 'flex shrink-0 items-center gap-2' : 'space-y-2'"
    aria-live="polite"
  >
    <p
      v-for="composition in compositions"
      :key="composition.categoryId"
      :class="[
        'font-sans font-bold',
        compact
          ? 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm'
          : 'text-sm',
        composition.isValid
          ? compact ? 'bg-[#f4e8dc] text-[#695149]' : 'text-[#695149]'
          : compact ? 'bg-[#fbe9e7] text-[#b3261e]' : 'text-[#b3261e]',
      ]"
    >
      <span v-if="!compact">{{ composition.categoryLabel }} : </span>
      {{ composition.quantity }}/{{ composition.requiredQuantity }}
      <span v-if="!compact && !composition.isValid"> — complétez votre sélection pour valider la commande.</span>
    </p>
  </div>
</template>
