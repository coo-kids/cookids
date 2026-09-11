<script setup lang="ts">
import { ShoppingBag } from "lucide-vue-next";
import AppButton from "./AppButton.vue";
import { useScrollState } from "../composables/useScrollState.js";

defineProps<{ cartCount: number }>();
const { isScrolled } = useScrollState();
</script>

<template>
  <header :class="['sticky top-0 z-30 h-[var(--app-header-height)] bg-cookids-cream/95 backdrop-blur-sm transition-shadow duration-200', isScrolled ? 'border-b border-stone-200/80 shadow-sm' : 'border-b border-transparent']">
    <div class="mx-auto flex h-full w-[calc(100%-2rem)] max-w-[1180px] items-center justify-between">
      <a href="#catalogue" aria-label="Cookids, voir le catalogue">
        <img class="h-auto w-32" src="/logo-optimized.webp" alt="Cookids">
      </a>
      <div class="relative">
        <AppButton as="a" href="#commande" variant="neutral" size="icon" aria-label="Voir le panier">
          <ShoppingBag :size="21" :stroke-width="2" aria-hidden="true" />
        </AppButton>
        <span v-if="cartCount > 0" class="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-cookids-coral font-sans text-xs font-bold text-white" aria-hidden="true">{{ cartCount }}</span>
      </div>
    </div>
  </header>
</template>
