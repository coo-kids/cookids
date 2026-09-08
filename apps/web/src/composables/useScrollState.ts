import { onBeforeUnmount, onMounted, ref } from "vue";

export function useScrollState() {
  const isScrolled = ref(false);

  function updateScrollState(): void {
    isScrolled.value = window.scrollY > 0;
  }

  onMounted(() => {
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", updateScrollState);
  });

  return { isScrolled };
}
