// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrderForm from "./OrderForm.vue";

describe("OrderForm", () => {
  it("harmonise le champ lieu et réinitialise la date au changement de lieu", async () => {
    const wrapper = mount(OrderForm);
    const select = wrapper.get("select");
    expect(select.classes()).toContain("appearance-none");
    expect(select.classes()).toContain("pr-11");
    expect(select.attributes("required")).toBeDefined();
    const arrow = select.element.parentElement!.querySelector("svg");
    expect(arrow?.getAttribute("aria-hidden")).toBe("true");
    expect(arrow?.classList.contains("pointer-events-none")).toBe(true);

    await select.setValue("IFSSO_kgDOBOB43g");
    await wrapper.get('input[type="date"]').setValue("2026-10-01");
    await select.setValue("IFSSO_kgDOBOB43w");
    expect((wrapper.get('input[type="date"]').element as HTMLInputElement).value).toBe("");
    wrapper.unmount();
  });

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 8, 19, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("limite le calendrier à demain et invalide une date passée", async () => {
    const wrapper = mount(OrderForm);
    const input = wrapper.get('input[type="date"]');
    expect(input.attributes("min")).toBe("2026-09-20");
    await input.setValue("2026-09-19");
    expect((input.element as HTMLInputElement).value).toBe("");
    await input.setValue("2026-09-20");
    expect((input.element as HTMLInputElement).value).toBe("2026-09-20");
    wrapper.unmount();
  });

  it("calcule demain au changement d’année en heure locale", () => {
    vi.setSystemTime(new Date(2026, 11, 31, 23, 30));
    const wrapper = mount(OrderForm);
    expect(wrapper.get('input[type="date"]').attributes("min")).toBe("2027-01-01");
    wrapper.unmount();
  });

  it("retire les dates d’aujourd’hui et passées de la liste", async () => {
    const wrapper = mount(OrderForm);
    await wrapper.get("select").setValue("IFSSO_kgDOBOB43A");
    const dateSelect = wrapper.findAll("select")[1]!;
    expect(dateSelect.findAll("option").map((option) => option.attributes("value"))).toEqual(["", "2026-09-26"]);
    wrapper.unmount();
  });

  it("ne propose pas un calendrier libre quand les dates fixes sont épuisées", async () => {
    vi.setSystemTime(new Date(2026, 8, 27, 12));
    const wrapper = mount(OrderForm);
    await wrapper.get("select").setValue("IFSSO_kgDOBOB43A");
    expect(wrapper.findAll("select")[1]!.attributes("disabled")).toBeDefined();
    expect(wrapper.find('input[type="date"]').exists()).toBe(false);
    expect(wrapper.text()).toContain("Aucune date de livraison disponible");
    await wrapper.get("form").trigger("submit");
    expect(wrapper.emitted("submit")).toBeUndefined();
    wrapper.unmount();
  });

  it("propose de revenir au panier", async () => {
    const wrapper = mount(OrderForm);
    const backButton = wrapper.findAll("button").find((button) => button.text() === "Revenir au panier");

    expect(backButton).toBeDefined();
    expect(backButton!.attributes("type")).toBe("button");
    await backButton!.trigger("click");

    expect(wrapper.emitted("back")).toHaveLength(1);
    expect(wrapper.emitted("submit")).toBeUndefined();
  });

  it("ouvre le calendrier natif au clic sur le champ date", async () => {
    const showPicker = vi.fn();
    const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "showPicker");
    Object.defineProperty(HTMLInputElement.prototype, "showPicker", {
      configurable: true,
      value: showPicker
    });

    try {
      const wrapper = mount(OrderForm);
      await wrapper.get('input[type="date"]').trigger("click");

      expect(showPicker).toHaveBeenCalledOnce();
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(HTMLInputElement.prototype, "showPicker", originalDescriptor);
      } else {
        Reflect.deleteProperty(HTMLInputElement.prototype, "showPicker");
      }
    }
  });

  it("valide les coordonnées sans envoyer la commande", async () => {
    const wrapper = mount(OrderForm);

    await wrapper.get('input[autocomplete="given-name"]').setValue("Romain");
    await wrapper.get('input[autocomplete="family-name"]').setValue("Lenzotti");
    await wrapper.get('input[autocomplete="email"]').setValue("romain@example.com");
    await wrapper.get('input[autocomplete="tel"]').setValue("0600000000");
    await wrapper.get("select").setValue("IFSSO_kgDOBOB43g");
    await wrapper.get('input[type="date"]').setValue("2026-10-01");
    await wrapper.get('input[maxlength="500"]').setValue("Merci de sonner à l’arrivée");
    await wrapper.get("form").trigger("submit");

    expect(wrapper.get('button[type="submit"]').text()).toBe("Valider les coordonnées");
    expect(wrapper.emitted("submit")).toEqual([[
      {
        firstName: "Romain",
        lastName: "Lenzotti",
        email: "romain@example.com",
        phoneNumber: "0600000000",
        deliveryLocation: "IFSSO_kgDOBOB43g",
        targetDeliveryDate: "2026-10-01",
        deliveryComment: "Merci de sonner à l’arrivée"
      }
    ]]);
  });
});
