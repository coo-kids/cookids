import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProductGrid from "./ProductGrid.vue";

describe("ProductGrid", () => {
  beforeEach(() => vi.stubGlobal("scrollTo", vi.fn()));

  afterEach(() => vi.unstubAllGlobals());

  it("affiche l'erreur après une tentative de validation incomplète", () => {
    const wrapper = mount(ProductGrid, {
      props: {
        quantities: {},
        categoryCompositions: [{
          categoryId: "cookies",
          categoryLabel: "Cookies",
          quantity: 13,
          requiredQuantity: 24,
          isValid: false,
        }],
        isCompositionValid: false,
        showCompositionErrors: true,
      },
    });

    const orderButton = wrapper.findAll("button").find((button) => button.text() === "Commander");

    expect(orderButton).toBeDefined();
    expect(orderButton!.attributes("disabled")).toBeUndefined();
    expect(wrapper.text()).toContain("13/24");
    expect(wrapper.text()).not.toContain("Cookies : 13/24");
    expect(wrapper.text()).toContain("Complétez cette sélection pour atteindre 24 éléments.");
    expect(wrapper.text()).not.toContain("Financiers :");
  });
});
