// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useCheckoutRoute } from "./useCheckoutRoute.js";

const CheckoutRouteHarness = defineComponent({
  setup() {
    return useCheckoutRoute();
  },
  template: `
    <p data-testid="checkout-state">{{ isCheckout }}</p>
    <p data-testid="project-state">{{ isProject }}</p>
    <button data-testid="open" @click="openCheckout">Ouvrir</button>
    <button data-testid="close" @click="closeCheckout">Fermer</button>
  `
});

describe("useCheckoutRoute", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  afterEach(() => {
    window.location.hash = "";
  });

  it("synchronise l'étape de commande avec le hash", async () => {
    const wrapper = mount(CheckoutRouteHarness);

    expect(wrapper.get('[data-testid="checkout-state"]').text()).toBe("false");

    await wrapper.get('[data-testid="open"]').trigger("click");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await nextTick();
    expect(window.location.hash).toBe("#commande");
    expect(wrapper.get('[data-testid="checkout-state"]').text()).toBe("true");

    await wrapper.get('[data-testid="close"]').trigger("click");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await nextTick();
    expect(wrapper.get('[data-testid="checkout-state"]').text()).toBe("false");
    wrapper.unmount();
  });

  it("affiche la page de présentation depuis son hash", async () => {
    window.history.replaceState(null, "", "#projet");
    const wrapper = mount(CheckoutRouteHarness);

    expect(wrapper.get('[data-testid="project-state"]').text()).toBe("true");
    expect(wrapper.get('[data-testid="checkout-state"]').text()).toBe("false");

    window.location.hash = "#catalogue";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await nextTick();

    expect(wrapper.get('[data-testid="project-state"]').text()).toBe("false");
    wrapper.unmount();
  });
});
