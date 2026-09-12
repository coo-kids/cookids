import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import CheckoutSummary from "./CheckoutSummary.vue";
import { catalog } from "../content/catalog.js";
import { formatEuro } from "@cookids/domain/utils/formatEuro";
describe("CheckoutSummary", () => {
  const product = catalog[0]!;
  const item = { productId: product.id, product, quantity: 12, total: 12 };
  it("masque les images sur mobile et réserve de la place aux prix et quantités", () => {
    const wrapper = mount(CheckoutSummary, { props: { items: [item], total: 12, editable: true } });
    expect(wrapper.get("img").classes()).toEqual(expect.arrayContaining(["hidden", "sm:block"]));
    expect(wrapper.get("table").classes()).toContain("table-fixed");
    expect(wrapper.get("colgroup col:nth-child(2)").classes()).toContain("w-30");
    expect(wrapper.get("colgroup col:nth-child(3)").classes()).toContain("w-24");
    expect(wrapper.get('[aria-label="Quantité"]').classes()).toContain("flex-row");
    expect(wrapper.get('[aria-label="Quantité"]').classes()).not.toContain("flex-col");
    expect(wrapper.get("tfoot").text()).toContain(formatEuro(12));
    expect(wrapper.get("tfoot td:last-child").classes()).toContain("whitespace-nowrap");
  });
  it("conserve les commandes de quantité et le récapitulatif non modifiable", async () => {
    const wrapper = mount(CheckoutSummary, { props: { items: [item], total: 12, editable: true } });
    await wrapper.get('[aria-label="Ajouter une unité"]').trigger("click");
    expect(wrapper.emitted("changeQuantity")).toEqual([[product.id, 13]]);
    await wrapper.setProps({ editable: false });
    expect(wrapper.get("colgroup col:nth-child(2)").classes()).toContain("w-16");
    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.get("tbody").text()).toContain("12");
  });
});
