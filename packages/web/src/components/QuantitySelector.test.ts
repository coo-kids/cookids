import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import QuantitySelector from "./QuantitySelector.vue";

describe("QuantitySelector", () => {
  it("désactive le zoom double-tap sur les boutons tout en permettant les clics répétés", async () => {
    const wrapper = mount(QuantitySelector, { props: { quantity: 12 } });
    for (const button of wrapper.findAll("button")) {
      expect(button.classes()).toContain("touch-manipulation");
    }
    const plus = wrapper.get('[aria-label="Ajouter une unité"]');
    await plus.trigger("click");
    await wrapper.setProps({ quantity: 13 });
    await plus.trigger("click");
    await wrapper.setProps({ quantity: 14 });
    await wrapper.get('[aria-label="Retirer une unité"]').trigger("click");
    expect(wrapper.emitted("change")).toEqual([[13], [14], [13]]);
  });

  it("conserve les limites de quantité", async () => {
    const wrapper = mount(QuantitySelector, { props: { quantity: 0 } });
    expect(wrapper.get('[aria-label="Retirer une unité"]').attributes("disabled")).toBeDefined();
    await wrapper.setProps({ quantity: 48 });
    expect(wrapper.get('[aria-label="Ajouter une unité"]').attributes("disabled")).toBeDefined();
  });
});
