// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AppHeader from "./AppHeader.vue";
import { useCart } from "../composables/useCart.js";
import { router } from "../router.js";

const cart = useCart();

beforeEach(() => {
  cart.clear();
  vi.stubGlobal("scrollTo", vi.fn());
});

afterEach(() => vi.unstubAllGlobals());

describe("AppHeader", () => {
  it("affiche le lien cagnotte avec une tirelire immédiatement avant le panier", () => {
    const wrapper = mount(AppHeader, { global: { plugins: [router] } });
    const cagnotteLink = wrapper.get('a[aria-label="Voir la cagnotte"]');
    expect(cagnotteLink.attributes("href")).toBe("/cagnotte");
    expect(cagnotteLink.get("svg").classes()).toContain("lucide-piggy-bank");
    expect(cagnotteLink.get("svg").attributes("aria-hidden")).toBe("true");
    expect(cagnotteLink.element.nextElementSibling).toBe(wrapper.get('a[aria-label="Voir le panier"]').element.parentElement);
  });

  it("ouvre directement le tunnel depuis le bouton panier", () => {
    cart.setQuantity("cookie-cafe-noix", 2);
    const wrapper = mount(AppHeader, { global: { plugins: [router] } });
    const cartLink = wrapper.get('a[aria-label="Voir le panier"]');

    expect(cartLink.attributes("href")).toBe("/commande");
    expect(wrapper.find("#cart-drawer").exists()).toBe(false);
    expect(wrapper.text()).toContain("2");
  });

  it("dimensionne les icônes sociales comme celle du panier", () => {
    const wrapper = mount(AppHeader, { global: { plugins: [router] } });
    const socialIcons = wrapper.findAll('a[aria-label^="Contacter Cookids"], a[aria-label^="Suivre Cookids"]');

    expect(socialIcons).toHaveLength(2);
    for (const socialIcon of socialIcons) {
      expect(socialIcon.get("svg").classes()).toContain("size-[21px]");
    }
  });
});
