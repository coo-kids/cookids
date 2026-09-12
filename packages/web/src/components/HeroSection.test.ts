import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HeroSection from "./HeroSection.vue";
import { router } from "../router.js";

describe("HeroSection", () => {
  beforeEach(() => vi.stubGlobal("scrollTo", vi.fn()));

  afterEach(() => vi.unstubAllGlobals());

  it("propose le lien vers la présentation comme action secondaire", () => {
    const wrapper = mount(HeroSection, { global: { plugins: [router] } });
    const projectLink = wrapper.get('a[href="/projet"]');

    expect(projectLink.text()).toBe("Découvrir mon projet");
    expect(projectLink.classes()).toContain("bg-[#f4e8dc]");
  });
});
