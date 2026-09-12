<script setup lang="ts">
import { RouterLink } from "vue-router";
import AppButton from "../components/AppButton.vue";
import { statistics } from "../content/statistics.js";
import { siteContent } from "../content/site.js";

const total = new Intl.NumberFormat("fr-FR").format(statistics.totalCookiesSold);
</script>

<template>
  <main class="min-h-[calc(100vh-var(--app-header-height))] bg-[radial-gradient(circle_at_50%_0%,#fff2bc_0,#fff9f0_57%)] px-4 py-12 sm:py-20">
    <section class="mx-auto max-w-3xl text-center">
      <h1 class="m-0 text-[clamp(2.5rem,6vw,4rem)] leading-tight">{{ siteContent.cagnotteTitle }}</h1>
      <img class="mx-auto my-8 w-full max-w-[200px] object-contain sm:max-w-[260px]" src="/images/pages/cookids-cookies.png" alt="" aria-hidden="true" />
      <p class="my-8 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight">
        <span class="block text-[clamp(4rem,12vw,7rem)] text-cookids-coral">{{ total }}</span>
        {{ siteContent.cagnotteCounter }}
      </p>
      <p class="mx-auto mb-8 max-w-xl font-sans text-lg leading-relaxed text-[#59443c]">{{ siteContent.cagnotteText }}</p>
      <AppButton :as="RouterLink" :to="{ name: 'home', hash: '#catalogue' }">Retour au catalogue</AppButton>
    </section>
  </main>
</template>
