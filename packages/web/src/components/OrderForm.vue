<script setup lang="ts">
import { computed, ref } from "vue";
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
      <label class="my-4 block font-sans text-[.92rem] font-bold">Lieu de livraison<select class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model="deliveryLocation" @change="targetDeliveryDate = ''" required><option value="" disabled>Choisir un lieu</option><option v-for="location in locations" :key="location.id" :value="location.id">{{ location.label }}</option></select></label>
      <label class="my-4 block font-sans text-[.92rem] font-bold">Date de livraison souhaitée
        <select v-if="hasFixedDeliveryDates" class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model="targetDeliveryDate" required><option value="" disabled>Choisir une date</option><option v-for="date in selectedDeliveryLocation?.fixedDeliveryDates" :key="date" :value="date">{{ date }}</option></select>
        <input v-else class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model="targetDeliveryDate" type="date" />
      </label>
      <label class="my-4 block font-sans text-[.92rem] font-bold">Commentaire <span class="text-[#80685d] font-normal">(facultatif)</span><input class="mt-[.4rem] block w-full rounded-[.55rem] border border-[#d9c6b8] bg-white p-3 font-serif font-normal" v-model.trim="deliveryComment" type="text" maxlength="500" /></label>
    </section>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row">
      <AppButton class="flex-1" type="button" variant="neutral" @click="emit('back')">Revenir au panier</AppButton>
      <AppButton class="flex-1" type="submit">Valider les coordonnées</AppButton>
    </div>
  </form>
</template>
