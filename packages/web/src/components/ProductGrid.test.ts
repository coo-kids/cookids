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
    expect(wrapper.text()).not.toContain("Les autres gourmandises :");
  });

  it("met visuellement en avant les catégories du catalogue", () => {
    const wrapper = mount(ProductGrid, { props: { quantities: {} } });
    const headings = wrapper.findAll("h3.text-3xl");

    expect(headings.map((heading) => heading.text())).toEqual([
      "Cookies",
      "Cookies sur mesure",
      "Les autres gourmandises",
    ]);
    expect(wrapper.text()).not.toContain("Les favoris en boîte");
    for (const heading of headings) {
      expect(heading.classes()).toContain("text-3xl");
      expect(heading.classes()).toContain("sm:text-4xl");
      expect(heading.element.parentElement?.parentElement?.classList.contains("bg-[#fff5ec]")).toBe(true);
    }
  });
});
