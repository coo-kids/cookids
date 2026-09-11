import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ProductGrid from "./ProductGrid.vue";

describe("ProductGrid", () => {
  it("affiche un bouton Commander qui mène au panier", () => {
    const wrapper = mount(ProductGrid, {
      props: { quantities: {} }
    });

    const orderLink = wrapper.get('a[href="#commande"]');

    expect(orderLink.text()).toBe("Commander");
  });
});
