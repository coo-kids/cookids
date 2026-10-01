// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, expect, it } from "vitest";
import ClearCartButton from "./ClearCartButton.vue";

describe("ClearCartButton", () => {
  it("demande confirmation avant d'émettre la suppression", async () => {
    const wrapper = mount(ClearCartButton);
    await wrapper.get("button").trigger("click");

    const dialog = document.body.querySelector('[role="dialog"]')!;
    expect(dialog.textContent).toContain("Vider le panier ?");
    expect(wrapper.emitted("confirm")).toBeUndefined();

    const confirmButton = Array.from(dialog.querySelectorAll("button")).find((button) => button.textContent?.includes("Oui, vider le panier"))!;
    confirmButton.click();
    await nextTick();

    expect(wrapper.emitted("confirm")).toHaveLength(1);
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
  });
});
