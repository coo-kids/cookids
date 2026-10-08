import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { Product } from "@cookids/domain/models/Product";
import ProductCard from "./ProductCard.vue";
import QuantitySelector from "./QuantitySelector.vue";
import { formatEuro } from "@cookids/domain/utils/formatEuro";

const product: Product = {
  id: "cookie", name: "Cookie", description: "Un cookie",
  ingredients: [], price: 1, image: "/cookie.jpg",
  category: "cookies", unitLabel: "1 unité",
};

describe("ProductCard", () => {
  it.each([true, false, undefined])("affiche le bandeau uniquement pour true (%s)", (is_limited_edition) => {
    const wrapper = mount(ProductCard, {
      props: { product: { ...product, is_limited_edition }, quantity: 0 },
    });
    expect(wrapper.text().includes("Édition limitée")).toBe(is_limited_edition === true);
    expect(wrapper.get("img").attributes("alt")).toBe(product.name);
  });

  it("masque la mention 1 unité pour les cookies vendus individuellement", () => {
    const wrapper = mount(ProductCard, { props: { product, quantity: 0 } });

    expect(wrapper.text()).not.toContain("1 unité");
    expect(wrapper.getComponent(QuantitySelector).props("step")).toBe(1);
  });

  it("affiche le conditionnement et configure le sélecteur", () => {
    const wrapper = mount(ProductCard, {
      props: { product: { ...product, quantityMultiple: 15 }, quantity: 0 },
    });

    expect(wrapper.get("h3").text()).toBe("Cookie (x 15)");
    expect(wrapper.text()).not.toContain("15 unités");
    expect(wrapper.get("strong.whitespace-nowrap").text()).toBe(formatEuro(1));
    expect(wrapper.text()).not.toContain(`${formatEuro(1)} l’unité`);
    expect(wrapper.getComponent(QuantitySelector).props("step")).toBe(15);
  });

  it("affiche la quantité minimale et conserve un pas unitaire", () => {
    const wrapper = mount(ProductCard, {
      props: { product: { ...product, minimumQuantity: 10 }, quantity: 0 },
    });

    expect(wrapper.get("h3").text()).toBe("Cookie (minimum 10)");
    expect(wrapper.getComponent(QuantitySelector).props("step")).toBe(1);
    expect(wrapper.getComponent(QuantitySelector).props("minimum")).toBe(10);
  });

  it("laisse chaque participant ajouter à l'unité en commande groupée", () => {
    const wrapper = mount(ProductCard, {
      props: { product: { ...product, minimumQuantity: 10 }, quantity: 0, enforceMinimum: false },
    });

    expect(wrapper.getComponent(QuantitySelector).props("minimum")).toBeUndefined();
  });
});
