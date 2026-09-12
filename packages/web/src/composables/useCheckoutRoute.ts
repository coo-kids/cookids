import { onMounted, onUnmounted, ref } from "vue";

const checkoutHash = "#commande";
const projectHash = "#projet";

export function useCheckoutRoute() {
  const isCheckout = ref(false);
  const isProject = ref(false);

  function syncRoute(): void {
    isCheckout.value = window.location.hash === checkoutHash;
    isProject.value = window.location.hash === projectHash;
  }

  function openCheckout(): void {
    window.location.hash = checkoutHash;
  }

  function closeCheckout(): void {
    window.location.hash = "catalogue";
  }

  onMounted(() => {
    syncRoute();
    window.addEventListener("hashchange", syncRoute);
  });

  onUnmounted(() => window.removeEventListener("hashchange", syncRoute));

  return { closeCheckout, isCheckout, isProject, openCheckout };
}
