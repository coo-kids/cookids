import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AppFooter from "./AppFooter.vue";

describe("AppFooter", () => {
  it("affiche uniquement la signature Cookids", () => {
    const wrapper = mount(AppFooter);

    expect(wrapper.text()).toContain(
      "Cookids · Des pâtisseries faites avec le cœur.",
    );
    expect(wrapper.find("a").exists()).toBe(false);
  });
});
