<script setup lang="ts">
import { computed, ref } from "vue";
import { ChevronDown } from "lucide-vue-next";
import type { CheckoutDetails } from "../types/CheckoutDetails.js";
import { locations } from "../content/locations.js";
import AppButton from "./AppButton.vue";

const props = defineProps<{ initialValues?: CheckoutDetails; showTitle?: boolean }>();
const emit = defineEmits<{ back: []; submit: [details: CheckoutDetails] }>();

const firstName = ref(props.initialValues?.firstName ?? "");
const lastName = ref(props.initialValues?.lastName ?? "");
const email = ref(props.initialValues?.email ?? "");
const phoneNumber = ref(props.initialValues?.phoneNumber ?? "");
const deliveryLocation = ref(props.initialValues?.deliveryLocation ?? "");
const targetDeliveryDate = ref(props.initialValues?.targetDeliveryDate ?? "");
const deliveryComment = ref(props.initialValues?.deliveryComment ?? "");
const selectedDeliveryLocation = computed(() => locations.find((location) => location.id === deliveryLocation.value));
const hasFixedDeliveryDates = computed(() => (selectedDeliveryLocation.value?.fixedDeliveryDates.length ?? 0) > 0);

function openDatePicker(event: MouseEvent): void {
  const input = event.currentTarget as HTMLInputElement;

  try {
    input.showPicker?.();
  } catch {
    // The native field remains usable when showPicker is unavailable or blocked.
  }
}

function submitDetails(): void {
  emit("submit", {
    firstName: firstName.value,
    lastName: lastName.value || undefined,
    email: email.value,
    phoneNumber: phoneNumber.value || undefined,
    deliveryLocation: deliveryLocation.value,
    targetDeliveryDate: targetDeliveryDate.value || undefined,
    deliveryComment: deliveryComment.value || undefined
  });
}
</script>

<template>
  <form class="mt-6" @submit.prevent="submitDetails">
    <section aria-labelledby="customer-details-title">
      <h2 v-if="showTitle !== false" id="customer-details-title" class="text-[1.7rem]">Vos coordonnées</h2>
      <label class="my-4 block font-sans text-[.92rem] font-bold">Prénom<input class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model.trim="firstName" required minlength="2" maxlength="100" autocomplete="given-name" /></label>
      <label class="my-4 block font-sans text-[.92rem] font-bold">Nom <span class="text-[#80685d] font-normal">(facultatif)</span><input class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model.trim="lastName" maxlength="100" autocomplete="family-name" /></label>
      <label class="my-4 block font-sans text-[.92rem] font-bold">Email<input class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model.trim="email" required type="email" maxlength="254" autocomplete="email" /></label>
      <label class="my-4 block font-sans text-[.92rem] font-bold">Téléphone <span class="text-[#80685d] font-normal">(facultatif)</span><input class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model.trim="phoneNumber" maxlength="30" autocomplete="tel" /></label>
    </section>

    <section class="mt-10 border-t border-[#eadace] pt-8" aria-labelledby="delivery-details-title">
      <h2 id="delivery-details-title" class="text-[1.7rem]">Livraison</h2>
      <label class="my-4 block font-sans text-[.92rem] font-bold">Lieu de livraison
        <span class="relative mt-[.4rem] block">
          <select class="block w-full appearance-none rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 pr-11 font-serif font-normal text-[#3f332d]" v-model="deliveryLocation" @change="targetDeliveryDate = ''" required>
            <option value="" disabled>Choisir un lieu</option>
            <option v-for="location in locations" :key="location.id" :value="location.id">{{ location.label }}</option>
          </select>
          <ChevronDown class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#80685d]" :stroke-width="1.8" aria-hidden="true" />
        </span>
      </label>
      <label class="my-4 block font-sans text-[.92rem] font-bold">Date de livraison souhaitée
        <span v-if="hasFixedDeliveryDates" class="relative mt-[.4rem] block">
          <select class="block w-full appearance-none rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 pr-11 font-serif font-normal text-[#3f332d]" v-model="targetDeliveryDate" required>
            <option value="" disabled>Choisir une date</option>
            <option v-for="date in selectedDeliveryLocation?.fixedDeliveryDates" :key="date" :value="date">{{ date }}</option>
          </select>
          <svg class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#80685d]" aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <path d="m5 7.5 5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <input v-else class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model="targetDeliveryDate" type="date" @click="openDatePicker" />
      </label>
      <label class="my-4 block font-sans text-[.92rem] font-bold">Commentaire <span class="text-[#80685d] font-normal">(facultatif)</span><input class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model.trim="deliveryComment" type="text" maxlength="500" /></label>
    </section>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row">
      <AppButton class="flex-1" type="button" variant="neutral" @click="emit('back')">Revenir au panier</AppButton>
      <AppButton class="flex-1" type="submit">Valider les coordonnées</AppButton>
    </div>
  </form>
</template>
