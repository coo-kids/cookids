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

  it("affiche entièrement le libellé du bouton d'ajout", () => {
    const wrapper = mount(GroupOrderControls, {
      props: { isGrouped: true, participants: [{ id: "one", label: "Camille" }], activeParticipantId: "one" },
    });
    const addButton = wrapper.findAll("button").find((button) => button.text() === "Ajouter")!;

    expect(addButton.classes()).toContain("whitespace-nowrap");
    expect(addButton.classes()).toContain("px-3");
    expect(addButton.classes()).not.toContain("size-9");
  });

  it("permet de nommer, sélectionner, ajouter et supprimer des participants", async () => {
    const participants = [
      { id: "one", label: "Camille" },
      { id: "two", label: "" },
    ];
    const wrapper = mount(GroupOrderControls, {
      props: { isGrouped: true, participants, activeParticipantId: "two" },
    });

    await wrapper.get("input").setValue("Bureau");
    await wrapper.findAll("button").find((button) => button.text().includes("Ajouter"))!.trigger("click");
    await wrapper.get('[aria-label="Supprimer ce participant"]').trigger("click");
    await wrapper.findAll("button").find((button) => button.text() === "Camille")!.trigger("click");

    expect(wrapper.emitted("updateLabel")).toContainEqual(["two", "Bureau"]);
    expect(wrapper.emitted("addParticipant")).toHaveLength(1);
    expect(wrapper.emitted("removeParticipant")).toContainEqual(["two"]);
    expect(wrapper.emitted("selectParticipant")).toContainEqual(["one"]);
  });
});
