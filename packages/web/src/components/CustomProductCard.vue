<script setup lang="ts">
import { computed, ref } from "vue";
import type { Product } from "@cookids/domain/models/Product";
import { formatEuro } from "@cookids/domain/utils/formatEuro";
import AppButton from "./AppButton.vue";

const props = defineProps<{ product: Product }>();
const emit = defineEmits<{ add: [toppingIds: string[]] }>();
const selectedIds = ref<string[]>([]);
const minimum = computed(() => props.product.minimumToppings ?? 1);
const maximum = computed(() => props.product.maximumToppings ?? 3);
const isValid = computed(() => selectedIds.value.length >= minimum.value && selectedIds.value.length <= maximum.value);

function toggleTopping(id: string): void {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== id);
  } else if (selectedIds.value.length < maximum.value) {
    selectedIds.value.push(id);
  }
}

function addBox(): void {
  if (!isValid.value) return;
  emit("add", [...selectedIds.value]);
  selectedIds.value = [];
}
</script>

<template>
  <article class="overflow-hidden rounded-[1.25rem] bg-white shadow-[0_8px_30px_rgba(76,44,25,.08)] md:col-span-2 xl:col-span-3">
    <div class="grid md:grid-cols-[minmax(240px,.8fr)_1.2fr]">
      <img class="h-64 w-full object-cover md:h-full" :src="product.image" :alt="product.name" />
      <div class="p-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div><h3 class="m-0 text-2xl">{{ product.name }}<template v-if="product.quantityMultiple"> (x {{ product.quantityMultiple }})</template></h3><p class="mb-0 mt-2 text-[#695149]">{{ product.description }}</p></div>
          <strong class="text-lg text-[#b85131]">{{ formatEuro(product.price * (product.quantityMultiple ?? 1)) }} la boîte</strong>
        </div>
        <p class="mb-3 mt-5 font-sans text-sm font-bold">Choisissez de {{ minimum }} à {{ maximum }} toppings — {{ selectedIds.length }}/{{ maximum }}</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="topping in product.availableToppings"
            :key="topping.id"
            type="button"
            :aria-pressed="selectedIds.includes(topping.id)"
            :disabled="!selectedIds.includes(topping.id) && selectedIds.length >= maximum"
            :class="['rounded-full border px-3 py-2 font-sans text-sm font-bold transition-colors disabled:opacity-40', selectedIds.includes(topping.id) ? 'border-cookids-coral bg-cookids-coral text-white' : 'border-[#d9c6b8] bg-white text-cookids-ink']"
            @click="toggleTopping(topping.id)"
          >{{ topping.label }}</button>
        </div>
        <AppButton class="mt-6 w-full" :disabled="!isValid" @click="addBox">Ajouter la boîte de {{ product.quantityMultiple }}</AppButton>
      </div>
    </div>
  </article>
</template>
