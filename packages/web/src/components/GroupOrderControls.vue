<script setup lang="ts">
import { Plus, Trash2, Users } from "lucide-vue-next";
import type { CartParticipant } from "../types/CartParticipant.js";
import AppButton from "./AppButton.vue";

defineProps<{
  isGrouped: boolean;
  participants: CartParticipant[];
  activeParticipantId?: string;
}>();
defineEmits<{
  enable: [];
  disable: [];
  addParticipant: [];
  removeParticipant: [participantId: string];
  selectParticipant: [participantId: string];
  updateLabel: [participantId: string, label: string];
}>();
</script>

<template>
  <section id="catalogue" class="scroll-mt-[var(--app-header-height)] border-b border-[#eadace] bg-[#fffaf4] py-6" aria-labelledby="order-mode-title">
    <div class="mx-auto w-[calc(100%-2rem)] max-w-[1180px]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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

        <div v-if="isGrouped" class="min-w-0 flex-1 lg:max-w-xl">
          <div class="flex flex-wrap gap-2" aria-label="Participants">
            <button
              v-for="(participant, index) in participants"
              :key="participant.id"
              type="button"
              :class="['rounded-full border px-3 py-2 font-sans text-sm font-bold', participant.id === activeParticipantId ? 'border-cookids-coral bg-[#fff0e5] text-cookids-coral' : 'border-[#d9c6b8] bg-white text-[#695149]']"
              @click="$emit('selectParticipant', participant.id)"
            >{{ participant.label.trim() || `Participant ${index + 1}` }}</button>
            <AppButton size="small" variant="neutral" @click="$emit('addParticipant')"><Plus :size="16" aria-hidden="true" /> Ajouter</AppButton>
          </div>

          <div v-for="(participant, index) in participants.filter(({ id }) => id === activeParticipantId)" :key="participant.id" class="mt-3 flex items-end gap-2">
            <label class="min-w-0 flex-1 font-sans text-sm font-bold text-cookids-ink">
              Libellé du participant
              <input
                :value="participant.label"
                class="mt-1 w-full rounded-xl border border-[#d9c6b8] bg-white px-3 py-2.5 font-sans font-normal outline-none focus:border-cookids-coral focus:ring-2 focus:ring-cookids-coral/20"
                type="text"
                maxlength="80"
                required
                :placeholder="`Ex. ${index === 0 ? 'Camille' : 'Bureau 2'}`"
                @input="$emit('updateLabel', participant.id, ($event.target as HTMLInputElement).value)"
              />
            </label>
            <AppButton
              v-if="participants.length > 1"
              variant="neutral"
              size="icon"
              aria-label="Supprimer ce participant"
              @click="$emit('removeParticipant', participant.id)"
            ><Trash2 :size="18" aria-hidden="true" /></AppButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
