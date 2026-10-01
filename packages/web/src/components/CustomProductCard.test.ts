import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { catalog } from "../content/catalog.js";
import CustomProductCard from "./CustomProductCard.vue";

describe("CustomProductCard", () => {
  const product = catalog.find((candidate) => candidate.id === "custom-cookie-box")!;

  it("impose de choisir entre un et trois toppings puis réinitialise la sélection", async () => {
    const wrapper = mount(CustomProductCard, { props: { product } });
    const addButton = wrapper.findAll("button").at(-1)!;
    const toppings = wrapper.findAll('button[aria-pressed]');

    expect(addButton.attributes("disabled")).toBeDefined();
    expect(wrapper.get("h3").text()).toBe("Ma boîte personnalisée (x 12)");
    await toppings[0]!.trigger("click");
    await toppings[1]!.trigger("click");
    await toppings[2]!.trigger("click");

    expect(toppings[3]!.attributes("disabled")).toBeDefined();
    expect(addButton.attributes("disabled")).toBeUndefined();
    await addButton.trigger("click");

    expect(wrapper.emitted("add")).toEqual([[[
      product.availableToppings![0]!.id,
      product.availableToppings![1]!.id,
      product.availableToppings![2]!.id,
    ]]])
    expect(addButton.attributes("disabled")).toBeDefined();
  });
});
