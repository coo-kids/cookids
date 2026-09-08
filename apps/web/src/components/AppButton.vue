<script setup lang="ts">
withDefaults(defineProps<{
  variant?: "primary" | "neutral" | "dark";
  size?: "default" | "icon" | "small";
  type?: "button" | "submit" | "reset";
  as?: "button" | "a";
}>(), {
  variant: "primary",
  size: "default",
  type: "button",
  as: "button"
});

const variants = {
  primary: "bg-cookids-coral text-white hover:bg-[#bd4f2f] focus-visible:ring-cookids-coral",
  neutral: "bg-transparent text-cookids-ink hover:bg-[#f4e8dc] focus-visible:ring-cookids-coral",
  dark: "bg-cookids-ink text-white hover:bg-[#49372f] focus-visible:ring-cookids-coral"
};

const sizes = {
  default: "min-h-11 rounded-full px-5 py-2.5",
  small: "size-9 rounded-full p-0",
  icon: "size-11 rounded-full p-0"
};
</script>

<template>
  <component
    :is="as"
    :type="as === 'button' ? type : undefined"
    :class="[variants[variant], sizes[size], 'inline-flex items-center justify-center font-sans text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50']"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>
