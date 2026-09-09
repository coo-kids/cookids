// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useCheckoutRoute } from "./useCheckoutRoute";

const CheckoutRouteHarness = defineComponent({
  setup() {
    return useCheckoutRoute();
  },
  template: `
    <p data-testid="state">{{ isCheckout }}</p>
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

    expect(wrapper.get('[data-testid="state"]').text()).toBe("false");

    await wrapper.get('[data-testid="open"]').trigger("click");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await nextTick();
    expect(window.location.hash).toBe("#commande");
    expect(wrapper.get('[data-testid="state"]').text()).toBe("true");

    await wrapper.get('[data-testid="close"]').trigger("click");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await nextTick();
    expect(wrapper.get('[data-testid="state"]').text()).toBe("false");
    wrapper.unmount();
  });
});
