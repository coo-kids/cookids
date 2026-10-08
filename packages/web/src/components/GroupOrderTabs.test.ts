import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import GroupOrderTabs from "./GroupOrderTabs.vue";

describe("GroupOrderTabs", () => {
  const participants = [{ id: "one", label: "Camille" }, { id: "two", label: "" }];

  it("affiche et édite les participants dans une barre d'onglets", async () => {
    const wrapper = mount(GroupOrderTabs, { props: { participants, activeParticipantId: "two" } });
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(2);
    expect(wrapper.findAll('[role="tab"]')[1].attributes("aria-selected")).toBe("true");

    await wrapper.get('[aria-label="Nom du participant 2"]').setValue("Bureau");
    await wrapper.get('[aria-label="Nom du participant 1"]').trigger("focus");
    expect(wrapper.emitted("updateLabel")).toContainEqual(["two", "Bureau"]);
    expect(wrapper.emitted("selectParticipant")).toContainEqual(["one"]);
  });

  it("ajoute et supprime des onglets", async () => {
    const wrapper = mount(GroupOrderTabs, { props: { participants, activeParticipantId: "two" } });
    await wrapper.get('[aria-label="Ajouter un participant"]').trigger("click");
    await wrapper.get('[aria-label="Supprimer le participant 2"]').trigger("click");
    expect(wrapper.emitted("addParticipant")).toHaveLength(1);
    expect(wrapper.emitted("removeParticipant")).toContainEqual(["two"]);
  });
});
