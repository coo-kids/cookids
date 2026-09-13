// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { useCheckoutDraft } from "./useCheckoutDraft.js";

describe("useCheckoutDraft", () => {
  const draft = useCheckoutDraft();

  beforeEach(() => draft.clear());

  it("persiste les coordonnées et l’étape courante", () => {
    draft.saveDetails({
      firstName: "Alice",
      email: "alice@example.com",
      deliveryLocation: "IFSSO_kgDOBOB43g",
    });
    draft.saveStep(2);

    expect(JSON.parse(localStorage.getItem("cookids:checkout-draft") ?? "null")).toEqual({
      details: {
        firstName: "Alice",
        email: "alice@example.com",
        deliveryLocation: "IFSSO_kgDOBOB43g",
      },
      step: 2,
    });
  });

  it("supprime le brouillon après confirmation", () => {
    draft.saveDetails({ firstName: "Alice", email: "alice@example.com", deliveryLocation: "" });
    draft.clear();

    expect(draft.details.value).toBeNull();
    expect(draft.step.value).toBe(1);
    expect(localStorage.getItem("cookids:checkout-draft")).toBeNull();
  });
});
