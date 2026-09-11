// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import OrderForm from "./OrderForm.vue";

describe("OrderForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("affiche un overlay de chargement pendant l’envoi de la commande", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    const wrapper = mount(OrderForm, { props: { items: [{ productId: "cookie-cafe-noix", quantity: 1 }] } });

    await wrapper.get("form").trigger("submit");

    expect(wrapper.get("form").attributes("aria-busy")).toBe("true");
    expect(wrapper.get('[role="status"]').text()).toContain("Nous enregistrons votre commande");
    expect(wrapper.get('[role="status"] img').attributes("src")).toBe("/images/pages/cookids-cook.png");
  });
});
