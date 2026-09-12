import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { Product } from "@cookids/domain/models/Product";
import ProductCard from "./ProductCard.vue";

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
});
