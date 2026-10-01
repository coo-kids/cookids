<script setup lang="ts">
import { ref } from "vue";
import { Trash2, X } from "lucide-vue-next";
import AppButton from "./AppButton.vue";

defineEmits<{ confirm: [] }>();
const isConfirmationVisible = ref(false);
</script>

<template>
  <button
    type="button"
    class="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 font-sans text-sm font-bold text-[#695149] transition-colors hover:bg-[#f4e8dc] hover:text-cookids-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cookids-coral focus-visible:ring-offset-2"
    @click="isConfirmationVisible = true"
  >
    <Trash2 :size="18" aria-hidden="true" />
    Vider le panier
  </button>

  <Teleport to="body">
    <div
      v-if="isConfirmationVisible"
      class="fixed inset-0 z-50 grid place-items-center bg-cookids-ink/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      @click.self="isConfirmationVisible = false"
    >
      <section
        class="w-full max-w-md rounded-2xl bg-[#fffaf4] p-6 shadow-[0_24px_80px_rgba(47,33,27,.3)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-cart-title"
        aria-describedby="clear-cart-description"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 id="clear-cart-title" class="m-0 text-2xl">Vider le panier ?</h2>
            <p id="clear-cart-description" class="mb-0 mt-3 text-[#695149]">Cette action supprimera tous les produits ainsi que les informations déjà saisies.</p>
          </div>
          <AppButton variant="neutral" size="small" aria-label="Fermer" @click="isConfirmationVisible = false">
            <X :size="18" aria-hidden="true" />
          </AppButton>
        </div>
        <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AppButton variant="neutral" @click="isConfirmationVisible = false">Annuler</AppButton>
          <AppButton @click="isConfirmationVisible = false; $emit('confirm')">Oui, vider le panier</AppButton>
        </div>
      </section>
    </div>
  </Teleport>
</template>
