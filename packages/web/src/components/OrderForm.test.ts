// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import OrderForm from "./OrderForm.vue";

describe("OrderForm", () => {
  it("valide les coordonnées sans envoyer la commande", async () => {
    const wrapper = mount(OrderForm);

    await wrapper.get('input[autocomplete="given-name"]').setValue("Romain");
    await wrapper.get('input[autocomplete="family-name"]').setValue("Lenzotti");
    await wrapper.get('input[autocomplete="email"]').setValue("romain@example.com");
    await wrapper.get('input[autocomplete="tel"]').setValue("0600000000");
    await wrapper.get("select").setValue("IFSSO_kgDOBOB43g");
    await wrapper.get('input[type="date"]').setValue("2026-10-01");
    await wrapper.get("form").trigger("submit");

    expect(wrapper.get('button[type="submit"]').text()).toBe("Valider mes coordonnées");
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
