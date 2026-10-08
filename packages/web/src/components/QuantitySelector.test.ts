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

  it("ajoute et retire une boîte entière sans dépasser la limite", async () => {
    const wrapper = mount(QuantitySelector, { props: { quantity: 0, step: 15 } });
    const plus = wrapper.get('[aria-label="Ajouter 15 unités"]');

    await plus.trigger("click");
    await wrapper.setProps({ quantity: 15 });
    await wrapper.get('[aria-label="Retirer 15 unités"]').trigger("click");

    expect(wrapper.emitted("change")).toEqual([[15], [0]]);
    await wrapper.setProps({ quantity: 45 });
    expect(plus.attributes("disabled")).toBeDefined();
  });

  it("atteint d'abord le minimum puis évolue à l'unité", async () => {
    const wrapper = mount(QuantitySelector, { props: { quantity: 0, minimum: 10 } });

    await wrapper.get('[aria-label="Ajouter 10 unités"]').trigger("click");
    await wrapper.setProps({ quantity: 10 });
    await wrapper.get('[aria-label="Ajouter une unité"]').trigger("click");
    await wrapper.setProps({ quantity: 11 });
    await wrapper.get('[aria-label="Retirer une unité"]').trigger("click");
    await wrapper.setProps({ quantity: 10 });
    await wrapper.get('[aria-label="Retirer 10 unités"]').trigger("click");

    expect(wrapper.emitted("change")).toEqual([[10], [11], [10], [0]]);
  });
});
