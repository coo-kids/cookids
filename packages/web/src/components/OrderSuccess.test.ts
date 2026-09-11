// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { OrderResponse } from "../types/OrderResponse.js";
import OrderSuccess from "./OrderSuccess.vue";

const order: OrderResponse = {
  id: 42,
  total: 7,
  deliveryLocation: "rosa-parks",
  items: [{ productName: "Cookie café & noix", quantity: 2, unitLabel: "pièce", total: 7 }]
};

describe("OrderSuccess", () => {
  it("confirme la commande sans répéter son récapitulatif", () => {
    const wrapper = mount(OrderSuccess, { props: { order } });

    expect(wrapper.text()).toContain("Ta commande est bien reçue.");
    expect(wrapper.text()).toContain("Votre numéro de commande : CKIDS-00042");
    expect(wrapper.text()).toContain("informations sur l’état d’avancement de votre commande");
    expect(wrapper.find("table").exists()).toBe(false);
    expect(wrapper.get('img[src="/images/pages/cookids-thanks.png"]').attributes("src")).toBe("/images/pages/cookids-thanks.png");
  });
});
