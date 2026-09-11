// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, expect, it } from "vitest";
import type { CheckoutDetails } from "../types/CheckoutDetails.js";
import type { EnrichedCartItem } from "../types/EnrichedCartItem.js";
import type { OrderResponse } from "../types/OrderResponse.js";
import CheckoutPage from "./CheckoutPage.vue";
import OrderForm from "./OrderForm.vue";
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

const order: OrderResponse = {
  id: 42,
  total: 7,
  deliveryLocation: "IFSSO_kgDOBOB43g",
  items: [{ productName: "Cookie café & noix", quantity: 2, unitLabel: "pièce", total: 7 }]
};

async function openDetails(wrapper: ReturnType<typeof mount>): Promise<void> {
  const validateButton = wrapper.findAll("button").find((button) => button.text() === "Valider mon panier");
  expect(validateButton).toBeDefined();
  await validateButton!.trigger("click");
  await nextTick();
}

describe("CheckoutPage", () => {
  it("affiche quatre étapes dans le tunnel", () => {
    const wrapper = mount(CheckoutPage, { props: { items, total: 7 } });

    expect(wrapper.text()).toContain("Panier");
    expect(wrapper.text()).toContain("Coordonnées");
    expect(wrapper.text()).toContain("Récapitulatif");
    expect(wrapper.text()).toContain("Confirmation");
  });

  it("affiche uniquement le formulaire à l’étape coordonnées", async () => {
    const wrapper = mount(CheckoutPage, { props: { items, total: 7 } });
    await openDetails(wrapper);

    expect(wrapper.get("h1").text()).toBe("Vos coordonnées");
    expect(wrapper.find("table").exists()).toBe(false);
    expect(wrapper.get('button[type="submit"]').text()).toBe("Valider les coordonnées");
  });

  it("revient au panier depuis l’étape coordonnées", async () => {
    const wrapper = mount(CheckoutPage, { props: { items, total: 7 } });
    await openDetails(wrapper);

    const backButton = wrapper.findAll("button").find((button) => button.text() === "Revenir au panier");
    expect(backButton).toBeDefined();
    await backButton!.trigger("click");
    await nextTick();

    expect(wrapper.get("h1").text()).toBe("Finaliser la commande");
    expect(wrapper.get("table").text()).toContain("Cookie café & noix");
  });

  it("revient aux coordonnées depuis le récapitulatif", async () => {
    const wrapper = mount(CheckoutPage, { props: { items, total: 7 } });
    await openDetails(wrapper);
    wrapper.getComponent(OrderForm).vm.$emit("submit", details);
    await nextTick();

    const backButton = wrapper.findAll("button").find((button) => button.text() === "Revenir aux coordonnées");
    expect(backButton).toBeDefined();
    await backButton!.trigger("click");
    await nextTick();

    expect(wrapper.get("h1").text()).toBe("Vos coordonnées");
    expect((wrapper.get('input[autocomplete="given-name"]').element as HTMLInputElement).value).toBe("Romain");
    expect((wrapper.get('input[autocomplete="email"]').element as HTMLInputElement).value).toBe("romain@example.com");
  });

  it("déplace les récapitulatifs à l’étape 3 puis confirme sans les répéter", async () => {
    const wrapper = mount(CheckoutPage, { props: { items, total: 7 } });
    await openDetails(wrapper);

    wrapper.getComponent(OrderForm).vm.$emit("submit", details);
    await nextTick();

    expect(wrapper.get("h1").text()).toBe("Récapitulatif");
    expect(wrapper.get("table").text()).toContain("Cookie café & noix");
    expect(wrapper.text()).toContain("romain@example.com");
    expect(wrapper.findAll("button").some((button) => button.text() === "Valider la commande")).toBe(true);

    wrapper.getComponent(OrderReview).vm.$emit("success", order);
    await nextTick();
    await wrapper.setProps({ items: [], total: 0 });

    expect(wrapper.text()).toContain("Ta commande est bien reçue.");
    expect(wrapper.text()).toContain("CKIDS-00042");
    expect(wrapper.find("table").exists()).toBe(false);
  });
});
