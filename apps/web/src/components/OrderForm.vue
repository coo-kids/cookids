<script setup lang="ts">
import { computed, ref } from "vue";
import type { CartItem } from "@cookids/domain/models/CartItem";
import type { OrderResponse } from "../types/OrderResponse";
import { siteContent } from "../content/site";
import AppButton from "./AppButton.vue";

const props = defineProps<{ items: CartItem[] }>();
const emit = defineEmits<{ success: [order: OrderResponse] }>();

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const phoneNumber = ref("");
const deliveryLocation = ref("");
const targetDeliveryDate = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);
const selectedDeliveryLocation = computed(() => siteContent.deliveryLocations.find((location) => location.id === deliveryLocation.value));
const hasFixedDeliveryDates = computed(() => (selectedDeliveryLocation.value?.fixedDeliveryDates.length ?? 0) > 0);

async function submitOrder(): Promise<void> {
  if (isSubmitting.value || props.items.length === 0) return;
  isSubmitting.value = true;
  errorMessage.value = "";
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: firstName.value, lastName: lastName.value || undefined, email: email.value, phoneNumber: phoneNumber.value || undefined, deliveryLocation: deliveryLocation.value, targetDeliveryDate: targetDeliveryDate.value ? new Date(`${targetDeliveryDate.value}T00:00:00.000Z`).toISOString() : undefined, items: props.items })
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
    <label class="my-4 block font-sans text-[.92rem] font-bold">Prénom<input class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model.trim="firstName" required minlength="2" maxlength="100" autocomplete="given-name" /></label>
    <label class="my-4 block font-sans text-[.92rem] font-bold">Nom <span class="text-[#80685d] font-normal">(facultatif)</span><input class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model.trim="lastName" maxlength="100" autocomplete="family-name" /></label>
    <label class="my-4 block font-sans text-[.92rem] font-bold">Email<input class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model.trim="email" required type="email" maxlength="254" autocomplete="email" /></label>
    <label class="my-4 block font-sans text-[.92rem] font-bold">Téléphone <span class="text-[#80685d] font-normal">(facultatif)</span><input class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model.trim="phoneNumber" maxlength="30" autocomplete="tel" /></label>
    <label class="my-4 block font-sans text-[.92rem] font-bold">Lieu de livraison<select class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model="deliveryLocation" @change="targetDeliveryDate = ''" required><option value="" disabled>Choisir un lieu</option><option v-for="location in siteContent.deliveryLocations" :key="location.id" :value="location.id">{{ location.label }}</option></select></label>
    <label class="my-4 block font-sans text-[.92rem] font-bold">Date de livraison souhaitée
      <select v-if="hasFixedDeliveryDates" class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model="targetDeliveryDate" required><option value="" disabled>Choisir une date</option><option v-for="date in selectedDeliveryLocation?.fixedDeliveryDates" :key="date" :value="date">{{ date }}</option></select>
      <input v-else class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model="targetDeliveryDate" type="date" />
    </label>
    <p v-if="errorMessage" class="font-sans text-[.9rem] font-bold text-[#b3261e]" role="alert">{{ errorMessage }}</p>
    <AppButton class="w-full disabled:cursor-wait" type="submit" :disabled="isSubmitting || items.length === 0">
      {{ isSubmitting ? "Envoi en cours…" : "Valider ma commande" }}
    </AppButton>
  </form>
</template>
