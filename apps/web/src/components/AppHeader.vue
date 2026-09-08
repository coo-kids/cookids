<script setup lang="ts">
import { ShoppingBag } from "lucide-vue-next";
import AppButton from "./AppButton.vue";
import { useScrollState } from "../composables/useScrollState";

defineProps<{ cartCount: number }>();
defineEmits<{ openCart: [] }>();
const { isScrolled } = useScrollState();
</script>

<template>
  <header :class="['sticky top-0 z-30 bg-cookids-cream/95 backdrop-blur-sm transition-shadow duration-200', isScrolled ? 'border-b border-stone-200/80 shadow-sm' : 'border-b border-transparent']">
    <div class="mx-auto flex w-[calc(100%-2rem)] max-w-[1180px] items-center justify-between py-4">
      <a class="text-[1.65rem] font-extrabold tracking-[-.05em] text-cookids-ink no-underline" href="#catalogue" aria-label="Cookids, voir le catalogue">Cookids<span class="text-cookids-coral">·</span></a>
      <div class="relative">
        <AppButton variant="neutral" size="icon" aria-label="Ouvrir le panier" @click="$emit('openCart')">
          <ShoppingBag :size="21" :stroke-width="2" aria-hidden="true" />
        </AppButton>
        <span v-if="cartCount > 0" class="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-cookids-coral font-sans text-xs font-bold text-white" aria-hidden="true">{{ cartCount }}</span>
      </div>
    </div>
  </header>
</template>
