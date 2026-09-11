// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import OrderForm from "./OrderForm.vue";

describe("OrderForm", () => {
  it("propose de revenir au panier", async () => {
    const wrapper = mount(OrderForm);
    const backButton = wrapper.findAll("button").find((button) => button.text() === "Revenir au panier");

    expect(backButton).toBeDefined();
    expect(backButton!.attributes("type")).toBe("button");
    await backButton!.trigger("click");

    expect(wrapper.emitted("back")).toHaveLength(1);
    expect(wrapper.emitted("submit")).toBeUndefined();
  });

  it("valide les coordonnées sans envoyer la commande", async () => {
    const wrapper = mount(OrderForm);

    await wrapper.get('input[autocomplete="given-name"]').setValue("Romain");
    await wrapper.get('input[autocomplete="family-name"]').setValue("Lenzotti");
    await wrapper.get('input[autocomplete="email"]').setValue("romain@example.com");
    await wrapper.get('input[autocomplete="tel"]').setValue("0600000000");
    await wrapper.get("select").setValue("IFSSO_kgDOBOB43g");
    await wrapper.get('input[type="date"]').setValue("2026-10-01");
    await wrapper.get("form").trigger("submit");

    expect(wrapper.get('button[type="submit"]').text()).toBe("Valider les coordonnées");
    expect(wrapper.emitted("submit")).toEqual([[
      {
        firstName: "Romain",
        lastName: "Lenzotti",
        email: "romain@example.com",
        phoneNumber: "0600000000",
        deliveryLocation: "IFSSO_kgDOBOB43g",
        targetDeliveryDate: "2026-10-01"
      }
    ]]);
  });
});
