<script setup lang="ts">
import { PiggyBank, ShoppingBag } from "lucide-vue-next";
import AppButton from "./AppButton.vue";
import SocialIcon from "./SocialIcon.vue";
import { useScrollState } from "../composables/useScrollState.js";
import { useCart } from "../composables/useCart.js";
import { siteContent } from "../content/site.js";
import { RouterLink } from "vue-router";

const { isScrolled } = useScrollState();
const cart = useCart();
</script>

<template>
  <header :class="['sticky top-0 z-30 h-[var(--app-header-height)] bg-cookids-cream/95 backdrop-blur-sm transition-shadow duration-200', isScrolled ? 'border-b border-stone-200/80 shadow-sm' : 'border-b border-transparent']">
    <div class="mx-auto flex h-full w-[calc(100%-2rem)] max-w-[1180px] items-center justify-between">
      <RouterLink :to="{ name: 'home', hash: '#catalogue' }" aria-label="Cookids, voir le catalogue">
        <img class="h-auto w-32" src="/logo-optimized.webp" alt="Cookids">
      </RouterLink>
      <div class="flex items-center gap-1">
        <a
          v-for="socialLink in siteContent.socialLinks"
          :key="socialLink.href"
          :href="socialLink.href"
          :title="socialLink.title"
          :aria-label="socialLink.title"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex size-11 items-center justify-center rounded-full text-cookids-ink transition-colors hover:bg-[#f4e8dc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cookids-coral focus-visible:ring-offset-2"
        >
          <SocialIcon :icon="socialLink.icon" class="size-[21px]" />
        </a>
        <AppButton :as="RouterLink" :to="{ name: 'cagnotte' }" variant="neutral" size="icon" aria-label="Voir la cagnotte" title="Voir la cagnotte">
          <PiggyBank :size="21" :stroke-width="2" aria-hidden="true" />
        </AppButton>
        <div class="relative">
          <AppButton :as="RouterLink" :to="{ name: 'checkout' }" variant="neutral" size="icon" aria-label="Voir le panier">
            <ShoppingBag :size="21" :stroke-width="2" aria-hidden="true" />
          </AppButton>
          <span v-if="cart.count.value > 0" class="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-cookids-coral font-sans text-xs font-bold text-white" aria-hidden="true">{{ cart.count.value }}</span>
        </div>
      </div>
    </div>
  </header>
</template>
