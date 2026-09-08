<script setup lang="ts">
import { ref } from "vue";
import type { CartItem } from "@cookids/domain/models/CartItem";

const props = defineProps<{ items: CartItem[] }>();
const emit = defineEmits<{ success: [order: OrderResponse] }>();

interface OrderResponse {
  id: string;
  totalCents: number;
  items: Array<{ productName: string; quantity: number; totalCents: number }>;
}

const name = ref("");
const email = ref("");
const phone = ref("");
const comment = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);

async function submitOrder(): Promise<void> {
  if (isSubmitting.value || props.items.length === 0) return;
  isSubmitting.value = true;
  errorMessage.value = "";
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.value, email: email.value, phone: phone.value || undefined, comment: comment.value || undefined, items: props.items })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message ?? "La commande n'a pas pu être envoyée.");
    emit("success", payload.order as OrderResponse);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "La commande n'a pas pu être envoyée.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <form class="mt-6" @submit.prevent="submitOrder">
    <h2 class="text-[1.7rem]">Vos coordonnées</h2>
    <label class="my-4 block font-sans text-[.92rem] font-bold">Nom<input class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model.trim="name" required minlength="2" maxlength="100" autocomplete="name" /></label>
    <label class="my-4 block font-sans text-[.92rem] font-bold">Email<input class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model.trim="email" required type="email" maxlength="254" autocomplete="email" /></label>
    <label class="my-4 block font-sans text-[.92rem] font-bold">Téléphone <span class="text-[#80685d] font-normal">(facultatif)</span><input class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model.trim="phone" maxlength="30" autocomplete="tel" /></label>
    <label class="my-4 block font-sans text-[.92rem] font-bold">Un mot pour Syline ? <span class="text-[#80685d] font-normal">(facultatif)</span><textarea class="mt-[.4rem] block w-full resize-y rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model.trim="comment" maxlength="600" rows="3" /></label>
    <p v-if="errorMessage" class="font-sans text-[.9rem] font-bold text-[#b3261e]" role="alert">{{ errorMessage }}</p>
    <button class="w-full rounded-full bg-cookids-coral px-[1.35rem] py-[.9rem] text-base font-bold text-white transition-colors hover:bg-[#bd4f2f] disabled:cursor-wait disabled:opacity-55" type="submit" :disabled="isSubmitting || items.length === 0">
      {{ isSubmitting ? "Envoi en cours…" : "Confirmer ma commande" }}
    </button>
  </form>
</template>
