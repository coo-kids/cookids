import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import HeroSection from "./HeroSection.vue";

describe("HeroSection", () => {
  it("propose le lien vers la présentation comme action secondaire", () => {
    const wrapper = mount(HeroSection);
    const projectLink = wrapper.get('a[href="#projet"]');

    expect(projectLink.text()).toBe("Découvrir mon projet");
    expect(projectLink.classes()).toContain("bg-[#f4e8dc]");
  });
});
