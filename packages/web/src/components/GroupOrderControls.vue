<script setup lang="ts">
import { Plus, Users, X } from "lucide-vue-next";
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

function tabInputWidth(label: string): string {
  return `${Math.max(12, Math.min(24, label.length + 2))}ch`;
}
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
          <p class="mb-2 mt-0 font-sans text-sm font-bold text-cookids-ink">Participants</p>
          <div class="overflow-x-auto pb-1">
            <div class="flex min-w-max items-center gap-2" role="tablist" aria-label="Participants">
            <div
              v-for="(participant, index) in participants"
              :key="participant.id"
              role="tab"
              :aria-selected="participant.id === activeParticipantId"
              :class="['flex items-center rounded-t-xl border border-b-2 px-2 py-1.5 transition-colors', participant.id === activeParticipantId ? 'border-cookids-coral border-b-cookids-coral bg-[#fff0e5]' : 'border-[#d9c6b8] border-b-transparent bg-white']"
            >
              <input
                :value="participant.label"
                :style="{ width: tabInputWidth(participant.label) }"
                class="min-w-0 border-0 bg-transparent px-2 py-1 font-sans text-sm font-bold text-cookids-ink outline-none placeholder:text-[#9a8175] focus:ring-0"
                type="text"
                maxlength="80"
                required
                :aria-label="`Nom du participant ${index + 1}`"
                :placeholder="`Participant ${index + 1}`"
                @focus="$emit('selectParticipant', participant.id)"
                @click="$emit('selectParticipant', participant.id)"
                @input="$emit('updateLabel', participant.id, ($event.target as HTMLInputElement).value)"
              />
              <button
                v-if="participants.length > 1"
                type="button"
                class="grid size-7 shrink-0 place-items-center rounded-full text-[#80685d] hover:bg-white hover:text-[#b3261e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cookids-coral"
                :aria-label="`Supprimer ${participant.label.trim() || `le participant ${index + 1}`}`"
                title="Supprimer ce participant"
                @click="$emit('removeParticipant', participant.id)"
              ><X :size="15" aria-hidden="true" /></button>
            </div>
            <AppButton class="shrink-0" size="small" variant="neutral" aria-label="Ajouter un participant" title="Ajouter un participant" @click="$emit('addParticipant')"><Plus :size="18" aria-hidden="true" /></AppButton>
            </div>
          </div>
          <p class="mb-0 mt-2 text-xs text-[#80685d]">Sélectionnez un onglet pour remplir le panier de ce participant.</p>
        </div>
      </div>
    </div>
  </section>
</template>
