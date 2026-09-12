<script setup lang="ts">
import AppFooter from "./components/AppFooter.vue";
import AppHeader from "./components/AppHeader.vue";
import { RouterView, useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <div class="[--app-header-height:5rem]">
    <AppHeader/>
    <RouterView/>
    <AppFooter v-if="route.name !== 'checkout'"/>
  </div>
</template>
