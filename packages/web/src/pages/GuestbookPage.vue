<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppButton from "../components/AppButton.vue";
import { siteContent } from "../content/site.js";
import type { GuestbookEntry } from "@cookids/domain/models/GuestbookEntry.js";

const author = ref("");
const comment = ref("");
const website = ref("");
const entries = ref<GuestbookEntry[]>([]);
const loading = ref(true);
const submitting = ref(false);
const loadError = ref("");
const message = ref("");
const error = ref("");

async function load() {
  loading.value = true;
  loadError.value = "";
  try {
    const response = await fetch("/api/guestbook");
    if (!response.ok) throw new Error();
    entries.value = (await response.json()).entries;
  } catch { loadError.value = "Les avis sont temporairement indisponibles."; }
  finally { loading.value = false; }
}
async function submit() {
  if (submitting.value) return;
  submitting.value = true;
  message.value = "";
  error.value = "";
  try {
    const response = await fetch("/api/guestbook", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: author.value, comment: comment.value, website: website.value })
    });
    if (!response.ok) {
      error.value = response.status === 429 ? "Veuillez patienter une minute avant de réessayer." : "Votre avis n’a pas pu être envoyé. Réessayez plus tard.";
      return;
    }
    author.value = "";
    comment.value = "";
    message.value = "Merci ! Votre avis sera visible après validation par Syline.";
  } catch { error.value = "Votre avis n’a pas pu être envoyé. Réessayez plus tard."; }
  finally { submitting.value = false; }
}
onMounted(load);
</script>

<template>
  <main class="min-h-screen bg-cookids-cream px-4 py-12">
    <div class="mx-auto max-w-2xl">
      <h1 class="text-center text-4xl">{{ siteContent.guestbookTitle }}</h1>
      <form class="my-8 space-y-5 rounded-3xl bg-white p-6 shadow-sm" @submit.prevent="submit">
        <h2 class="text-2xl">{{ siteContent.guestbookFormTitle }}</h2>
        <p class="font-sans">Votre avis sera publié après validation. N’indiquez pas d’informations personnelles dans votre commentaire.</p>
        <label class="block font-sans" for="guest-author">Votre prénom ou pseudo</label>
        <input id="guest-author" v-model="author" required maxlength="80" autocomplete="nickname" class="w-full rounded-xl border border-stone-300 p-3 font-sans" />
        <label class="block font-sans" for="guest-comment">Votre commentaire</label>
        <textarea id="guest-comment" v-model="comment" required maxlength="2000" rows="5" class="w-full rounded-xl border border-stone-300 p-3 font-sans"></textarea>
        <div class="hidden" aria-hidden="true">
          <label for="guest-website">Site internet</label>
          <input id="guest-website" v-model="website" tabindex="-1" autocomplete="off" />
        </div>
        <p v-if="message" role="status" class="font-sans text-green-800">{{ message }}</p>
        <p v-if="error" role="alert" class="font-sans text-red-800">{{ error }}</p>
        <AppButton type="submit" class="w-full" :disabled="submitting">{{ submitting ? 'Envoi en cours…' : 'Envoyer mon avis' }}</AppButton>
      </form>
      <section aria-labelledby="guestbook-reviews" :aria-busy="loading">
        <h2 id="guestbook-reviews" class="text-2xl">{{ siteContent.guestbookReviewsTitle }}</h2>
        <p v-if="loading" role="status">Chargement des avis…</p>
        <div v-else-if="loadError" role="alert"><p>{{ loadError }}</p><AppButton @click="load">Réessayer</AppButton></div>
        <p v-else-if="!entries.length">Le livre d’or attend vos premiers petits mots !</p>
        <article v-for="(entry, index) in entries" :key="index" class="my-5 rounded-3xl bg-white p-6 shadow-sm">
          <p class="whitespace-pre-wrap break-words font-sans leading-relaxed">{{ entry.comment }}</p>
          <p class="mt-4 break-words text-right font-sans font-bold">— {{ entry.author }}</p>
        </article>
      </section>
    </div>
  </main>
</template>
