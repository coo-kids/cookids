<script setup lang="ts">
import { siteContent } from "../content/site.js";
import AppButton from "./AppButton.vue";
import { RouterLink } from "vue-router";
</script>

<template>
  <section class="overflow-hidden bg-[radial-gradient(circle_at_50%_0%,#fff2bc_0,#fff9f0_57%)] px-4 py-10 sm:py-14 lg:py-8">
    <div class="mx-auto grid max-w-[1180px] items-center gap-4 md:grid-cols-[1.05fr_.95fr]">
      <div class="order-2 text-center md:order-1 md:text-left">
        <p class="m-0 font-sans text-[.78rem] font-bold uppercase tracking-[.14em] text-[#b85131]">{{ siteContent.brand }} ·
          pâtisserie solidaire</p>
        <h1 class="mb-4 mt-[.45rem] text-[clamp(2.9rem,5.7vw,4.5rem)] leading-[.96] tracking-[-.075em]">
          {{ siteContent.heroTitle }}
        </h1>
        <p class="mx-auto mb-8 max-w-[570px] text-base leading-[1.55] md:mx-0">{{ siteContent.heroText }}</p>
        <div class="flex flex-wrap justify-center gap-3 md:justify-start">
          <AppButton :as="RouterLink" :to="{ name: 'home', hash: '#catalogue' }">Voir les gourmandises</AppButton>
          <AppButton :as="RouterLink" :to="{ name: 'project' }" variant="neutral">Découvrir mon projet</AppButton>
        </div>
      </div>
      <img class="order-1 mx-auto w-full max-w-[260px] sm:max-w-[320px] md:order-2 md:max-w-[360px] lg:max-w-[400px]" src="/hero-banner-v2-optimized.webp" alt="Syline entourée de cookies Cookids">
    </div>
  </section>
</template>
