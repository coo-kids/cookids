// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CheckoutDetails } from "../types/CheckoutDetails.js";
import type { OrderResponse } from "../types/OrderResponse.js";
import CheckoutPage from "./CheckoutPage.vue";
import { siteContent } from "../content/site.js";
import OrderForm from "../components/OrderForm.vue";
import OrderReview from "../components/OrderReview.vue";
import { useCart } from "../composables/useCart.js";
import { router } from "../router.js";

const cart = useCart();

const details: CheckoutDetails = {
  firstName: "Romain",
  lastName: "Lenzotti",
  email: "romain@example.com",
  phoneNumber: "0600000000",
  deliveryLocation: "IFSSO_kgDOBOB43g",
  targetDeliveryDate: "2026-10-01",
  deliveryComment: "Merci de sonner à l’arrivée"
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

function mountCheckoutPage(): ReturnType<typeof mount> {
  return mount(CheckoutPage, { global: { plugins: [router] } });
}

describe("CheckoutPage", () => {
  beforeEach(() => {
    vi.stubGlobal("scrollTo", vi.fn());
    cart.clear();
    cart.setQuantity("cookie-cafe-noix", 12);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("revient en haut à l’ouverture et à chaque changement d’étape", async () => {
    const wrapper = mountCheckoutPage();
    await nextTick();
    await nextTick();

    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "smooth" });

    await openDetails(wrapper);
    await nextTick();

    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "smooth" });
  });

  it("affiche quatre étapes dans le tunnel", () => {
    const wrapper = mountCheckoutPage();

    expect(wrapper.text()).toContain("Panier");
    expect(wrapper.text()).toContain("Coordonnées");
    expect(wrapper.text()).toContain("Récapitulatif");
    expect(wrapper.text()).toContain("Confirmation");
  });

  it("affiche uniquement le formulaire à l’étape coordonnées", async () => {
    const wrapper = mountCheckoutPage();
    await openDetails(wrapper);

    expect(wrapper.get("h1").text()).toBe("Vos coordonnées");
    expect(wrapper.find("table").exists()).toBe(false);
    expect(wrapper.get('button[type="submit"]').text()).toBe("Valider les coordonnées");
  });

  it("revient au panier depuis l’étape coordonnées", async () => {
    const wrapper = mountCheckoutPage();
    await openDetails(wrapper);

    const backButton = wrapper.findAll("button").find((button) => button.text() === "Revenir au panier");
    expect(backButton).toBeDefined();
    await backButton!.trigger("click");
    await nextTick();

    expect(wrapper.get("h1").text()).toBe(siteContent.orderTitle);
    expect(wrapper.get("table").text()).toContain("Cookie café & noix");
  });

  it("revient aux coordonnées depuis le récapitulatif", async () => {
    const wrapper = mountCheckoutPage();
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
    const wrapper = mountCheckoutPage();
    await openDetails(wrapper);

    wrapper.getComponent(OrderForm).vm.$emit("submit", details);
    await nextTick();

    expect(wrapper.get("h1").text()).toBe("Récapitulatif");
    expect(wrapper.get("table").text()).toContain("Cookie café & noix");
    expect(wrapper.text()).toContain("romain@example.com");
    expect(wrapper.text()).toContain("Livraison");
    expect(wrapper.text()).toContain("Merci de sonner à l’arrivée");
    expect(wrapper.findAll("button").some((button) => button.text() === "Valider la commande")).toBe(true);

    wrapper.getComponent(OrderReview).vm.$emit("success", order);
    await nextTick();

    expect(wrapper.text()).toContain("Ta commande est bien reçue.");
    expect(wrapper.text()).toContain("CKIDS-00042");
    expect(wrapper.find("table").exists()).toBe(false);
  });
});
