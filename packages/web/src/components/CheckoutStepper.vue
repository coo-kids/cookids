<script setup lang="ts">
defineProps<{ currentStep: 1 | 2 | 3 }>();
const emit = defineEmits<{ goToStep: [step: 1 | 2] }>();

const steps = ["Panier", "Coordonnées", "Confirmation"];
</script>

<template>
  <ol class="mb-8 flex items-start font-sans text-xs font-bold uppercase tracking-[.08em] text-[#80685d] sm:mb-10">
    <li
      v-for="(step, index) in steps"
      :key="step"
      class="flex min-w-0 flex-1 items-center last:flex-none"
      :class="{ 'text-cookids-coral': index + 1 === currentStep, 'text-[#8c776e]': index + 1 !== currentStep }"
    >
      <button
        v-if="currentStep < 3 && index + 1 < currentStep"
        type="button"
        class="group flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cookids-coral focus-visible:ring-offset-2"
        :aria-label="`Revenir à l’étape ${step}`"
        @click="emit('goToStep', (index + 1) as 1 | 2)"
      >
        <span class="flex size-7 shrink-0 items-center justify-center rounded-full border border-cookids-coral bg-cookids-coral text-white transition-colors group-hover:bg-[#bd4f2f]">{{ index + 1 }}</span>
        <span class="ml-2 hidden underline-offset-4 group-hover:underline sm:block">{{ step }}</span>
      </button>
      <template v-else>
        <span
          class="flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors"
          :class="index + 1 <= currentStep ? 'border-cookids-coral bg-cookids-coral text-white' : 'border-[#d9c6ba] bg-white'"
        >{{ index + 1 }}</span>
        <span class="ml-2 hidden sm:block">{{ step }}</span>
      </template>
      <span v-if="index < steps.length - 1" class="mx-3 h-px min-w-3 flex-1 bg-[#dfcec3] sm:mx-4" />
    </li>
  </ol>
</template>
