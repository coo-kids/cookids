<script setup lang="ts">
import { catalog, categories } from "../content/catalog.js";
import type { CategoryComposition } from "../composables/useCart.js";
import AppButton from "./AppButton.vue";
import CategoryCompositionStatus from "./CategoryCompositionStatus.vue";
import ProductCard from "./ProductCard.vue";

const props = withDefaults(defineProps<{
  quantities: Record<string, number>;
  categoryCompositions?: CategoryComposition[];
  isCompositionValid?: boolean;
  showCompositionErrors?: boolean;
}>(), {
  categoryCompositions: () => [],
  isCompositionValid: true,
  showCompositionErrors: false,
});
defineEmits<{
  changeQuantity: [productId: string, quantity: number];
  goToCheckout: [];
}>();

function hasInvalidComposition(categoryId: string): boolean {
  return props.showCompositionErrors && props.categoryCompositions.some(
    (composition) => composition.categoryId === categoryId && !composition.isValid,
  );
}
</script>

<template>
  <section id="catalogue" class="bg-white py-[4.5rem]" aria-labelledby="catalogue-title">
    <div class="mx-auto w-[calc(100%-2rem)] max-w-[1180px]">
      <div class="mb-8">
        <p class="m-0 font-sans text-[.78rem] font-bold uppercase tracking-[.14em] text-[#b85131]">Le catalogue</p>
        <h2 id="catalogue-title" class="my-2 text-[clamp(2.1rem,5vw,3.8rem)] leading-none tracking-[-.055em] md:whitespace-nowrap">Les gourmandises du moment</h2>
        <p class="max-w-[580px] leading-[1.5]">Les cookies pèsent entre 40 et 42 g crus. Ils sont vendus à l'unité.</p>
      </div>
      <div
        v-for="category in categories"
        :id="`category-${category.id}`"
        :key="category.id"
        class="mt-10 first:mt-0"
      >
        <div class="mb-5">
          <div class="flex items-center justify-between gap-4">
            <h3 class="m-0 text-2xl tracking-[-.035em]">{{ category.label }}</h3>
            <CategoryCompositionStatus
              compact
              :compositions="categoryCompositions.filter((composition) => composition.categoryId === category.id)"
            />
          </div>
          <p v-if="category.quantityMultiple" class="mt-1 text-[#695149]">Composez votre sélection par multiple de {{ category.quantityMultiple }}.</p>
          <p v-if="hasInvalidComposition(category.id)" class="mt-2 font-sans text-sm font-bold text-[#b3261e]" role="alert">
            Complétez cette sélection pour atteindre {{ categoryCompositions.find((composition) => composition.categoryId === category.id)?.requiredQuantity }} éléments.
          </p>
        </div>
        <div class="grid grid-cols-1 gap-[1.35rem] md:grid-cols-2 xl:grid-cols-3">
          <ProductCard
            v-for="product in catalog.filter((product) => product.category === category.id)"
            :key="product.id"
            :product="product"
            :quantity="quantities[product.id] ?? 0"
            @change-quantity="$emit('changeQuantity', product.id, $event)"
          />
        </div>
      </div>
      <div class="mt-10 flex justify-center">
        <AppButton @click="$emit('goToCheckout')">Commander</AppButton>
      </div>
    </div>
  </section>
</template>
