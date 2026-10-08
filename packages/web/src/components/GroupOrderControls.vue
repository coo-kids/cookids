<script setup lang="ts">
import { Users } from "lucide-vue-next";

defineProps<{
  isGrouped: boolean;
}>();
defineEmits<{
  enable: [];
  disable: [];
}>();
</script>

<template>
  <section id="catalogue" class="scroll-mt-[var(--app-header-height)] border-b border-[#eadace] bg-[#fffaf4] py-6" aria-labelledby="order-mode-title">
    <div class="mx-auto w-[calc(100%-2rem)] max-w-[1180px]">
      <div>
        <div>
          <p id="order-mode-title" class="m-0 font-sans text-sm font-bold text-cookids-ink">Comment souhaitez-vous commander ?</p>
          <div class="mt-2 inline-flex rounded-full border border-[#d9c6b8] bg-white p-1" role="group" aria-label="Type de commande">
            <button
              type="button"
              :class="['rounded-full px-4 py-2 font-sans text-sm font-bold transition-colors', !isGrouped ? 'bg-cookids-ink text-white' : 'text-[#695149] hover:bg-[#fff0e5]']"
              @click="$emit('disable')"
            >Commande individuelle</button>
            <button
              type="button"
              :class="['rounded-full px-4 py-2 font-sans text-sm font-bold transition-colors', isGrouped ? 'bg-cookids-ink text-white' : 'text-[#695149] hover:bg-[#fff0e5]']"
              @click="$emit('enable')"
            ><Users :size="16" class="mr-1 inline" aria-hidden="true" />Commande groupée</button>
          </div>
          <p v-if="isGrouped" class="mb-0 mt-2 max-w-xl text-sm text-[#695149]">
            Chaque participant compose son panier. Les quantités requises sont calculées sur la commande complète.
          </p>
        </div>

      </div>
    </div>
  </section>
</template>
