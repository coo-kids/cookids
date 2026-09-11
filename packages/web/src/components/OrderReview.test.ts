// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CheckoutDetails } from "../types/CheckoutDetails.js";
import type { EnrichedCartItem } from "../types/EnrichedCartItem.js";
import OrderReview from "./OrderReview.vue";

const items: EnrichedCartItem[] = [{
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
}];

const details: CheckoutDetails = {
  firstName: "Romain",
  lastName: "Lenzotti",
  email: "romain@example.com",
  phoneNumber: "0600000000",
  deliveryLocation: "IFSSO_kgDOBOB43g",
  targetDeliveryDate: "2026-10-01"
};

describe("OrderReview", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("affiche la commande et toutes les coordonnées en lecture seule", () => {
    const wrapper = mount(OrderReview, { props: { details, items, total: 7 } });

    expect(wrapper.get("h1").text()).toBe("Récapitulatif");
    expect(wrapper.get("table").text()).toContain("Cookie café & noix");
    expect(wrapper.text()).toContain("Romain");
    expect(wrapper.text()).toContain("Lenzotti");
    expect(wrapper.text()).toContain("romain@example.com");
    expect(wrapper.text()).toContain("0600000000");
    expect(wrapper.text()).toContain("Le Perreux-sur-Marne");
    expect(wrapper.text()).toContain("1 octobre 2026");
    expect(wrapper.find('[aria-label="Quantité"]').exists()).toBe(false);
  });

  it("envoie la commande et affiche le spinner à la validation finale", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    const wrapper = mount(OrderReview, { props: { details, items, total: 7 } });

    await wrapper.get("button").trigger("click");

    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(wrapper.get('[role="status"]').text()).toContain("Nous enregistrons votre commande");
    expect(wrapper.get('[role="status"] img').attributes("src")).toBe("/images/pages/cookids-cook.png");
  });
});
