<script setup lang="ts">
import type { SocialLink } from "@cookids/domain/schemas/SiteContentSchema.js";
import WhatsApp from "../icons/WhatsApp.vue";
import Instagram from "../icons/Instagram.vue";

defineProps<{ icon: SocialLink["icon"] }>();

</script>

<template>
  <WhatsApp v-if="icon === 'whatsapp'" v-bind="$attrs" />
  <Instagram v-if="icon === 'instagram'" v-bind="$attrs" />
</template>
