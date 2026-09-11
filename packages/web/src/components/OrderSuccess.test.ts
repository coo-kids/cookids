// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { EnrichedCartItem } from "../types/EnrichedCartItem.js";
import type { OrderResponse } from "../types/OrderResponse.js";
import OrderSuccess from "./OrderSuccess.vue";

const items: EnrichedCartItem[] = [
  {
    productId: "cookie-cafe-noix",
    quantity: 2,
    total: 7,
    product: {
      id: "cookie-cafe-noix",
      name: "Cookie café & noix",
      description: "Un cookie gourmand.",
      ingredients: [],
      price: 3.5,
      image: "/images/cookie-cafe-noix.jpg",
      category: "cookies",
      unitLabel: "pièce"
    }
  }
];

const order: OrderResponse = {
  id: 42,
  total: 7,
  deliveryLocation: "rosa-parks",
  items: [{ productName: "Cookie café & noix", quantity: 2, unitLabel: "pièce", total: 7 }]
};

describe("OrderSuccess", () => {
  it("réutilise le récapitulatif de commande en lecture seule", () => {
    const wrapper = mount(OrderSuccess, { props: { order, items } });

    expect(wrapper.get("table").text()).toContain("Cookie café & noix");
    expect(wrapper.get("table").text()).toContain("3,50 € pièce");
    expect(wrapper.get("table").text()).toContain("7,00 €");
    expect(wrapper.get("img").attributes("src")).toBe("/images/cookie-cafe-noix.jpg");
    expect(wrapper.find('[aria-label="Quantité"]').exists()).toBe(false);
    expect(wrapper.text()).toContain("Commande : #42");
  });
});
