<script setup lang="ts">
import AppButton from "./AppButton.vue";
</script>

<template>
  <main class="px-4 py-12 sm:py-16">
    <article class="mx-auto max-w-4xl rounded-2xl border border-[#eadace] bg-white px-6 py-10 shadow-sm sm:px-12 sm:py-14">
      <p class="m-0 text-center font-sans text-[.82rem] font-bold uppercase tracking-[.16em] text-[#b85131]">Notre projet</p>
      <h1 class="mx-auto mb-10 mt-3 max-w-2xl text-center text-[2.2rem] leading-tight sm:text-[2.8rem]">
        Des gourmandises pour soutenir leurs projets
      </h1>

      <div class="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
        <img
          class="mx-auto w-full max-w-[16rem] object-contain lg:order-2 lg:sticky lg:top-28 lg:max-w-none"
          src="/images/pages/cookids-project.png"
          alt="Syline, créatrice de Cookids"
        />

        <div class="space-y-5 font-sans text-[1rem] leading-7 text-[#59443c] sm:text-[1.05rem] lg:order-1">
          <p>Bonjour,</p>

          <p>
            Je m’appelle Syline et je suis maman de deux enfants. Avec Cookids, je souhaite soutenir les projets pédagogiques de l’école maternelle de ma fille et de l’association des assistantes maternelles qui accueille mon bébé.
          </p>

          <p>
            L’année dernière, j’ai organisé une vente de cookies afin de récolter des fonds. Grâce à votre participation, l’ensemble des bénéfices a été reversé à l’école maternelle.
          </p>

          <p>
            Cette année, j’ai décidé de renouveler l’aventure en proposant davantage de gourmandises, avec une nouvelle vente chaque mois.
          </p>

          <p>
            Tous les bénéfices seront reversés à l’école maternelle et à l’association des assistantes maternelles. Ils permettront de contribuer au financement de leurs projets pédagogiques et d’offrir de nouvelles activités aux enfants.
          </p>

          <p class="font-bold text-cookids-ink">
            Chaque commande, petite ou grande, participe directement à cette belle initiative.
          </p>

          <p>Merci infiniment pour votre soutien et votre gourmandise !</p>

          <p class="font-bold text-[#b85131]">Syline</p>
        </div>
      </div>

      <AppButton as="a" class="mx-auto mt-10 w-fit" href="#catalogue">
        Découvrir le catalogue
      </AppButton>
    </article>
  </main>
</template>
