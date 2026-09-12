<script setup lang="ts">
import { Quote } from "lucide-vue-next";
import AppButton from "../components/AppButton.vue";
import { useScrollReveal } from "../composables/useScrollReveal.js";
import { siteContent } from "../content/site.js";
import { RouterLink } from "vue-router";

const { setRevealElement } = useScrollReveal();
</script>

<template>
  <main class="min-h-[calc(100vh-var(--app-header-height))] bg-[#fffaf4]">
    <section
        class="overflow-hidden bg-[radial-gradient(circle_at_50%_0%,#fff2bc_0,#fff9f0_57%)] px-4 py-10 sm:py-14 lg:py-8">
      <div class="mx-auto grid max-w-[1180px] items-center gap-4 md:grid-cols-[1.05fr_.95fr]">
        <div class="order-2 text-center md:order-1 md:text-left">
          <p class="m-0 font-sans text-[.78rem] font-bold uppercase tracking-[.14em] text-[#b85131]">
            {{ siteContent.projectLabel }}</p>
          <h1 class="mb-4 mt-[.45rem] text-[clamp(2.9rem,5.7vw,4.5rem)] leading-[.96] tracking-[-.075em]">
            {{ siteContent.projectTitle }}
          </h1>
          <div class="flex flex-wrap justify-center gap-3 md:justify-start">
            <AppButton :as="RouterLink" :to="{ name: 'home', hash: '#catalogue' }">Découvrir le catalogue</AppButton>
          </div>
        </div>
        <img
            class="order-1 mx-auto w-full max-w-[180px] object-contain sm:max-w-[210px] md:order-2 md:max-w-[240px] lg:max-w-[280px]"
            src="/images/pages/cookids-project.png"
            alt="Syline, créatrice de Cookids"
        />
      </div>
    </section>

    <section
        v-for="(section, index) in siteContent.projectSections"
        :key="section.title"
        :class="[index % 2 === 0 ? 'bg-white' : 'bg-[#fffaf4]', index === 0 ? 'px-4 py-12 sm:py-16' : 'px-4 py-20 sm:py-28']"
    >
      <article
          :ref="setRevealElement"
          :class="[
          'mx-auto items-center gap-10 opacity-0 transition-[opacity,transform] duration-700 ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100',
          'max-w-[900px] translate-y-8',
          index === 1 ? 'grid md:grid-cols-[.7fr_1.3fr] md:gap-10 md:[&>div]:order-2 md:[&>img]:order-1' : ''
        ]"
      >
        <template v-if="index === 2">
          <h2 class="m-0 text-center text-[clamp(2.3rem,5vw,3.5rem)] leading-none tracking-[-.055em] md:whitespace-nowrap">
            {{ section.title }}</h2>

          <div class="mt-10 grid items-center gap-8 md:grid-cols-[1.25fr_.75fr] md:gap-4">
            <div class="text-center md:text-left">
              <div class="space-y-5 font-sans text-[1rem] leading-7 text-[#59443c] sm:text-[1.05rem]">
                <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
              </div>
            </div>
            <img v-if="section.image"
                 class="mx-auto w-full max-w-[190px] object-contain sm:max-w-[220px] md:max-w-[240px] md:justify-self-end"
                 :src="section.image" :alt="section.imageAlt"/>
          </div>

          <div v-if="section.closing" class="mt-9 text-center">
            <p class="mx-auto max-w-xl font-sans text-lg font-bold leading-8 text-cookids-ink">{{ section.closing }}</p>
            <p v-if="section.signature" class="mt-4 font-sans text-lg font-bold text-cookids-coral">{{
                section.signature
              }}</p>
          </div>

        </template>

        <template v-else>
          <div :class="index === 0 ? 'mx-auto max-w-3xl text-center' : 'text-center md:text-left'">
            <Quote v-if="index === 0" class="mx-auto mb-4 size-10 text-cookids-coral" aria-hidden="true"/>
            <h2 class="m-0 text-[clamp(2.3rem,5vw,3.5rem)] leading-none tracking-[-.055em]">{{ section.title }}</h2>
            <div class="mt-7 space-y-5 font-sans text-[1rem] leading-7 text-[#59443c] sm:text-[1.05rem]">
              <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
            </div>
          </div>
          <img v-if="section.image"
               class="mx-auto w-full max-w-[190px] object-contain sm:max-w-[220px] md:max-w-[240px]"
               :src="section.image" :alt="section.imageAlt"/>
        </template>
      </article>


    </section>
    <div class="text-center p-20">
      <AppButton :as="RouterLink" :to="{ name: 'home', hash: '#catalogue' }">Découvrir le catalogue</AppButton>
    </div>
  </main>
</template>
