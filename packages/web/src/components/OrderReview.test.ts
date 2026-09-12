// @vitest-environment jsdom
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CheckoutDetails } from "../types/CheckoutDetails.js";
import type { EnrichedCartItem } from "../types/EnrichedCartItem.js";
import OrderReview from "./OrderReview.vue";

const items: EnrichedCartItem[] = [{
  productId: "cookie-cafe-noix",
  quantity: 2,
  total: 7,
  product: {
    id: "cookie-cafe-noix",
    name: "Cookie café & noix",
    description: "Un cookie gourmand.",
    ingredients: [],
    price: 3.5,
    image: "/images/cookie-cafe-noix.jpg",
    category: "cookies",
    unitLabel: "pièce"
  }
}];

const details: CheckoutDetails = {
  firstName: "Romain",
  lastName: "Lenzotti",
  email: "romain@example.com",
  phoneNumber: "0600000000",
  deliveryLocation: "IFSSO_kgDOBOB43g",
  targetDeliveryDate: "2026-10-01",
  deliveryComment: "Merci de sonner à l’arrivée"
};

describe("OrderReview", () => {
  const wrappers: VueWrapper[] = [];
  const mountReview = (isLoadingPreview = false) => {
    const wrapper = mount(OrderReview, { props: { details, items, total: 7, isLoadingPreview } });
    wrappers.push(wrapper);
    return wrapper;
  };

  beforeEach(() => vi.stubGlobal("scrollTo", vi.fn()));
  afterEach(() => {
    wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
    vi.unstubAllGlobals();
  });

  it("affiche la commande et toutes les coordonnées en lecture seule", () => {
    const wrapper = mountReview();

    expect(wrapper.get("h1").text()).toBe("Récapitulatif");
    expect(wrapper.get("table").text()).toContain("Cookie café & noix");
    expect(wrapper.text()).toContain("Romain");
    expect(wrapper.text()).toContain("Lenzotti");
    expect(wrapper.text()).toContain("romain@example.com");
    expect(wrapper.text()).toContain("0600000000");
    expect(wrapper.text()).toContain("Le Perreux-sur-Marne");
    expect(wrapper.text()).toContain("1 octobre 2026");
    expect(wrapper.text()).toContain("Merci de sonner à l’arrivée");
    expect(wrapper.findAll("h2").map((heading) => heading.text())).toEqual(["Votre commande", "Vos coordonnées", "Livraison"]);
    expect(wrapper.find('[aria-label="Quantité"]').exists()).toBe(false);
  });

  it("propose de revenir aux coordonnées sans envoyer la commande", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const wrapper = mountReview();
    const backButton = wrapper.findAll("button").find((button) => button.text() === "Revenir aux coordonnées");

    expect(backButton).toBeDefined();
    await backButton!.trigger("click");

    expect(wrapper.emitted("back")).toHaveLength(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envoie la commande et affiche le spinner à la validation finale", async () => {
    const fetchMock = vi.fn((_url: string, _init?: RequestInit) => new Promise<Response>(() => {}));
    vi.stubGlobal("fetch", fetchMock);
    const wrapper = mountReview();
    const submitButton = wrapper.findAll("button").find((button) => button.text() === "Valider la commande");

    expect(submitButton).toBeDefined();
    await submitButton!.trigger("click");

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(request.body as string).deliveryComment).toBe("Merci de sonner à l’arrivée");
    expect(wrapper.attributes("aria-busy")).toBe("true");
    const overlay = document.querySelector('[role="status"]')!;
    expect(overlay.textContent).toContain("Nous enregistrons votre commande");
    expect(overlay.querySelector("img")?.getAttribute("src")).toBe("/images/pages/cookids-cook.png");
    expect(document.body.contains(overlay)).toBe(true);
    expect(wrapper.element.contains(overlay)).toBe(false);
    expect(overlay.classList.contains("fixed")).toBe(true);
    expect(overlay.classList.contains("inset-0")).toBe(true);
    expect(overlay.classList.contains("z-50")).toBe(true);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" });
    expect(vi.mocked(window.scrollTo).mock.invocationCallOrder[0]).toBeLessThan(fetchMock.mock.invocationCallOrder[0]);
    expect(wrapper.findAll("button").every((button) => button.attributes("disabled") !== undefined)).toBe(true);
  });

  it("affiche aussi l'aperçu du loader plein écran et revient en haut", () => {
    const wrapper = mountReview(true);
    const overlay = document.querySelector('[role="status"]')!;
    expect(document.body.contains(overlay)).toBe(true);
    expect(wrapper.element.contains(overlay)).toBe(false);
    expect(window.scrollTo).toHaveBeenCalledOnce();
  });

  it.each([true, false])("retire le loader après une réponse serveur (succès=%s)", async (ok) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok, json: async () => ok
      ? { order: { id: 42 } }
      : { error: { message: "Erreur d'envoi" } } }));
    const wrapper = mountReview();
    await wrapper.findAll("button")[1].trigger("click");
    await flushPromises();
    expect(document.querySelector('[role="status"]')).toBeNull();
    expect(wrapper.attributes("aria-busy")).toBe("false");
    if (ok) expect(wrapper.emitted("success")).toHaveLength(1);
    else expect(wrapper.get('[role="alert"]').text()).toBe("Erreur d'envoi");
  });
});
