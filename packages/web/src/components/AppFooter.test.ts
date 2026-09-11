import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AppFooter from "./AppFooter.vue";

describe("AppFooter", () => {
  it("affiche un lien vers le profil LinkedIn du créateur", () => {
    const wrapper = mount(AppFooter);
    const creatorLink = wrapper.get('a[href="https://www.linkedin.com/in/romainlenzotti/"]');

    expect(creatorLink.text()).toBe("Romain L.");
    expect(wrapper.text()).toContain("Site fait par Romain L.");
  });
});
