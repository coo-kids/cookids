import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProductGrid from "./ProductGrid.vue";
import { router } from "../router.js";

describe("ProductGrid", () => {
  beforeEach(() => vi.stubGlobal("scrollTo", vi.fn()));

  afterEach(() => vi.unstubAllGlobals());

  it("affiche un bouton Commander qui mène au panier", () => {
    const wrapper = mount(ProductGrid, {
      props: { quantities: {} },
      global: { plugins: [router] }
    });

    const orderLink = wrapper.get('a[href="/commande"]');

    expect(orderLink.text()).toBe("Commander");
  });
});
