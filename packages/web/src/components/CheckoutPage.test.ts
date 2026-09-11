// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, expect, it } from "vitest";
import type { EnrichedCartItem } from "../types/EnrichedCartItem.js";
import type { OrderResponse } from "../types/OrderResponse.js";
import CheckoutPage from "./CheckoutPage.vue";
import OrderForm from "./OrderForm.vue";

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

describe("CheckoutPage", () => {
  it("ouvre la confirmation simulée depuis l’aperçu de développement", async () => {
    const wrapper = mount(CheckoutPage, { props: { items, total: 7 } });
    const confirmationButton = wrapper.findAll("button").find((button) => button.text() === "Voir la confirmation");

    expect(confirmationButton).toBeDefined();
    await confirmationButton!.trigger("click");
    await nextTick();

    expect(wrapper.text()).toContain("Ta commande est bien reçue.");
    expect(wrapper.text()).toContain("CKIDS-00000");
    expect(wrapper.findAll("table")).toHaveLength(1);
  });

  it("affiche le formulaire avant le récapitulatif à l’étape coordonnées", async () => {
    const wrapper = mount(CheckoutPage, { props: { items, total: 7 } });

    const validateButton = wrapper.findAll("button").find((button) => button.text() === "Valider mon panier");
    expect(validateButton).toBeDefined();
    await validateButton!.trigger("click");
    await nextTick();

    expect(wrapper.get("h1").text()).toBe("Vos coordonnées");
    expect(wrapper.html().indexOf("<form")).toBeLessThan(wrapper.html().indexOf("<table"));
    expect(wrapper.text()).toContain("Récapitulatif");
  });

  it("conserve le récapitulatif confirmé lorsque le panier est vidé", async () => {
    const wrapper = mount(CheckoutPage, { props: { items, total: 7 } });

    const validateButton = wrapper.findAll("button").find((button) => button.text() === "Valider mon panier");
    expect(validateButton).toBeDefined();
    await validateButton!.trigger("click");
    wrapper.getComponent(OrderForm).vm.$emit("success", order);
    await nextTick();
    await wrapper.setProps({ items: [], total: 0 });

    expect(wrapper.text()).toContain("Ta commande est bien reçue.");
    expect(wrapper.get("table").text()).toContain("Cookie café & noix");
    expect(wrapper.get("table").text()).toContain("7,00 €");
  });
});
