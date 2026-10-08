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

  it("affiche un bouton plus pour ajouter un onglet", () => {
    const wrapper = mount(GroupOrderControls, {
      props: { isGrouped: true, participants: [{ id: "one", label: "Camille" }], activeParticipantId: "one" },
    });
    const addButton = wrapper.get('[aria-label="Ajouter un participant"]');

    expect(addButton.classes()).toContain("size-9");
    expect(addButton.get("svg").classes()).toContain("lucide-plus");
  });

  it("permet de nommer, sélectionner, ajouter et supprimer des participants", async () => {
    const participants = [
      { id: "one", label: "Camille" },
      { id: "two", label: "" },
    ];
    const wrapper = mount(GroupOrderControls, {
      props: { isGrouped: true, participants, activeParticipantId: "two" },
    });

    const secondTabInput = wrapper.get('[aria-label="Nom du participant 2"]');
    await secondTabInput.setValue("Bureau");
    await wrapper.get('[aria-label="Ajouter un participant"]').trigger("click");
    await wrapper.get('[aria-label="Supprimer le participant 2"]').trigger("click");
    await wrapper.get('[aria-label="Nom du participant 1"]').trigger("focus");

    expect(wrapper.emitted("updateLabel")).toContainEqual(["two", "Bureau"]);
    expect(wrapper.emitted("addParticipant")).toHaveLength(1);
    expect(wrapper.emitted("removeParticipant")).toContainEqual(["two"]);
    expect(wrapper.emitted("selectParticipant")).toContainEqual(["one"]);
  });

  it("affiche les participants sous forme d'onglets éditables", () => {
    const wrapper = mount(GroupOrderControls, {
      props: {
        isGrouped: true,
        participants: [{ id: "one", label: "Camille" }, { id: "two", label: "Bureau" }],
        activeParticipantId: "two",
      },
    });

    expect(wrapper.get('[role="tablist"]').attributes("aria-label")).toBe("Participants");
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(2);
    expect(wrapper.findAll('[role="tab"]')[1].attributes("aria-selected")).toBe("true");
    expect((wrapper.get('[aria-label="Nom du participant 1"]').element as HTMLInputElement).value).toBe("Camille");
  });
});
