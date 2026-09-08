<script setup lang="ts">
import { siteContent } from "../content/site";
import AppButton from "./AppButton.vue";
</script>

<template>
  <section
      class="bg-[radial-gradient(circle_at_50%_0%,#fff2bc_0,#fff9f0_57%)] px-4 py-[clamp(4rem,11vw,8.5rem)] text-center">
    <p class="m-0 font-sans text-[.78rem] font-bold uppercase tracking-[.14em] text-[#b85131]">{{ siteContent.brand }} ·
      pâtisserie solidaire</p>
    <h1 class="mx-auto mb-4 mt-[.45rem] max-w-[850px] text-[clamp(2.9rem,7vw,6rem)] leading-[.96] tracking-[-.075em]">
      {{ siteContent.heroTitle }}
    </h1>
    <p class="mx-auto mb-8 max-w-[570px] text-base leading-[1.55]">{{ siteContent.heroText }}</p>
    <AppButton as="a" href="#catalogue">Voir les gourmandises</AppButton>
  </section>
</template>
