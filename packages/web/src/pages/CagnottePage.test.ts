import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import CagnottePage from "./CagnottePage.vue";

vi.mock("../content/statistics.js", () => ({ statistics: { totalCookiesSold: 1248 } }));

describe("CagnottePage", () => {
  it("affiche le total et un retour au catalogue sans bouton ajouté à l'accueil", () => {
    const wrapper = mount(CagnottePage, { global: { stubs: { RouterLink: true } } });
    expect(wrapper.get("img").attributes("src")).toBe("/images/pages/cagnotte.png");
    expect(wrapper.text()).toContain(new Intl.NumberFormat("fr-FR").format(1248));
    expect(wrapper.text()).toContain("cookies déjà vendus !");
    expect(wrapper.findComponent({ name: "AppButton" }).attributes("to")).toBeDefined();
  });
});
