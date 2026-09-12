// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AppHeader from "./AppHeader.vue";

describe("AppHeader", () => {
  it("ouvre directement le tunnel depuis le bouton panier", () => {
    const wrapper = mount(AppHeader, { props: { cartCount: 2 } });
    const cartLink = wrapper.get('a[aria-label="Voir le panier"]');

    expect(cartLink.attributes("href")).toBe("#commande");
    expect(wrapper.find("#cart-drawer").exists()).toBe(false);
    expect(wrapper.text()).toContain("2");
  });

  it("dimensionne les icônes sociales comme celle du panier", () => {
    const wrapper = mount(AppHeader, { props: { cartCount: 0 } });
    const socialIcons = wrapper.findAll('a[aria-label^="Contacter Cookids"], a[aria-label^="Suivre Cookids"]');

    expect(socialIcons).toHaveLength(2);
    for (const socialIcon of socialIcons) {
      expect(socialIcon.get("svg").classes()).toContain("size-[21px]");
    }
  });
});
