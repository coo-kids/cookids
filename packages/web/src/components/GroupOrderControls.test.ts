import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import GroupOrderControls from "./GroupOrderControls.vue";

describe("GroupOrderControls", () => {
  it("active la commande groupée", async () => {
    const wrapper = mount(GroupOrderControls, {
      props: { isGrouped: false, participants: [] },
    });

    await wrapper.findAll("button").find((button) => button.text().includes("Commande groupée"))!.trigger("click");

    expect(wrapper.emitted("enable")).toHaveLength(1);
  });

  it("affiche l'explication sans les participants dans la zone de choix", () => {
    const wrapper = mount(GroupOrderControls, { props: { isGrouped: true } });
    expect(wrapper.text()).toContain("Chaque participant compose son panier");
    expect(wrapper.find('[role="tablist"]').exists()).toBe(false);
  });
});
