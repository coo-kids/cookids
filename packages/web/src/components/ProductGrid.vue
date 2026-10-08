<script setup lang="ts">
import { catalog, categories } from "../content/catalog.js";
import type { CategoryComposition, MinimumComposition } from "../composables/useCart.js";
import AppButton from "./AppButton.vue";
import CategoryCompositionStatus from "./CategoryCompositionStatus.vue";
import ProductCard from "./ProductCard.vue";
import CustomProductCard from "./CustomProductCard.vue";
import ClearCartButton from "./ClearCartButton.vue";

const props = withDefaults(defineProps<{
  quantities: Record<string, number>;
  categoryCompositions?: CategoryComposition[];
  isCompositionValid?: boolean;
  showCompositionErrors?: boolean;
  hasItems?: boolean;
  participantLabelsValid?: boolean;
  activeParticipantLabel?: string;
  grouped?: boolean;
  minimumCompositions?: MinimumComposition[];
}>(), {
  categoryCompositions: () => [],
  isCompositionValid: true,
  showCompositionErrors: false,
  hasItems: false,
  participantLabelsValid: true,
  grouped: false,
  minimumCompositions: () => [],
});
defineEmits<{
  changeQuantity: [productId: string, quantity: number];
  addCustomizedProduct: [productId: string, toppingIds: string[]];
  clearCart: [];
  goToCheckout: [];
}>();

function hasInvalidComposition(categoryId: string): boolean {
  return props.showCompositionErrors && props.categoryCompositions.some(
    (composition) => composition.categoryId === categoryId && !composition.isValid,
  );
}
</script>

<template>
  <section id="catalogue-products" class="bg-white py-[4.5rem]" aria-labelledby="catalogue-title">
    <div class="mx-auto w-[calc(100%-2rem)] max-w-[1180px]">
      <div class="mb-8">
        <p class="m-0 font-sans text-[.78rem] font-bold uppercase tracking-[.14em] text-[#b85131]">Le catalogue</p>
        <h2 id="catalogue-title" class="my-2 text-[clamp(2.1rem,5vw,3.8rem)] leading-none tracking-[-.055em] md:whitespace-nowrap">Les gourmandises du moment</h2>
        <p class="max-w-[580px] leading-[1.5]">Les cookies pèsent entre 40 et 42 g crus. Ils sont vendus à l'unité.</p>
        <p v-if="grouped" class="mt-4 inline-flex rounded-full bg-[#fff0e5] px-4 py-2 font-sans text-sm font-bold text-cookids-coral">
          Sélection pour {{ activeParticipantLabel?.trim() || "le participant à nommer" }}
        </p>
        <div v-if="grouped && minimumCompositions.length" class="mt-3 flex flex-wrap gap-2 text-sm">
          <span
            v-for="composition in minimumCompositions"
            :key="composition.productId"
            :class="['rounded-full px-3 py-1.5 font-sans font-bold', composition.isValid ? 'bg-[#edf7ed] text-[#35683a]' : 'bg-[#fff0e5] text-[#b3261e]']"
          >{{ composition.productName }} : {{ composition.quantity }}/{{ composition.requiredQuantity }} minimum</span>
        </div>
      </div>
      <div
        v-for="category in categories.filter((category) => catalog.some((product) => product.category === category.id))"
        :id="`category-${category.id}`"
        :key="category.id"
        class="mt-14 first:mt-0"
      >
        <div class="mb-6 rounded-2xl border border-[#eadace] bg-[#fff5ec] px-5 py-4 sm:px-6 sm:py-5">
          <div class="flex items-center justify-between gap-4">
            <h3 class="m-0 text-3xl leading-none tracking-[-.04em] text-cookids-ink sm:text-4xl">{{ category.label }}</h3>
            <CategoryCompositionStatus
              compact
              :compositions="categoryCompositions.filter((composition) => composition.categoryId === category.id)"
            />
          </div>
          <p v-if="category.quantityMultiple" class="mb-0 mt-2 text-[#695149]">Composez votre sélection par multiple de {{ category.quantityMultiple }}.</p>
          <p v-if="hasInvalidComposition(category.id)" class="mt-2 font-sans text-sm font-bold text-[#b3261e]" role="alert">
            Complétez cette sélection pour atteindre {{ categoryCompositions.find((composition) => composition.categoryId === category.id)?.requiredQuantity }} éléments.
          </p>
        </div>
        <div class="grid grid-cols-1 gap-[1.35rem] md:grid-cols-2 xl:grid-cols-3">
          <CustomProductCard
            v-for="product in catalog.filter((product) => product.category === category.id && product.availableToppings)"
            :key="product.id"
            :product="product"
            @add="$emit('addCustomizedProduct', product.id, $event)"
          />
          <ProductCard
            v-for="product in catalog.filter((product) => product.category === category.id && !product.availableToppings)"
            :key="product.id"
            :product="product"
            :quantity="quantities[product.id] ?? 0"
            :enforce-minimum="!grouped"
            @change-quantity="$emit('changeQuantity', product.id, $event)"
          />
        </div>
      </div>
      <div class="mt-10 flex justify-center">
        <AppButton :disabled="!participantLabelsValid" @click="$emit('goToCheckout')">Commander</AppButton>
      </div>
      <p v-if="!participantLabelsValid" class="mt-3 text-center font-sans text-sm font-bold text-[#b3261e]" role="alert">Renseignez un libellé différent pour chaque participant avant de continuer.</p>
      <div v-if="hasItems" class="mt-3 flex justify-center">
        <ClearCartButton @confirm="$emit('clearCart')" />
      </div>
    </div>
  </section>
</template>
