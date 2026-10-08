// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { catalog } from "../content/catalog.js";
import { useCart } from "./useCart.js";

describe("useCart", () => {
  const cart = useCart();
  const classicProduct = catalog.find((product) => product.id === "cookie-chocolat-noir")!;
  const customProduct = catalog.find((product) => product.id === "custom-cookie-box")!;
  const financierProduct = catalog.find((product) => product.id === "financiers-amandes")!;

  beforeEach(() => {
    cart.clear();
    cart.isCartOpen.value = false;
  });

  it("calcule les articles enrichis et le total", () => {
    const product = classicProduct;

    cart.setQuantity(product.id, 2);

    expect(cart.count.value).toBe(2);
    expect(cart.quantityFor(product.id)).toBe(2);
    expect(cart.enrichedItems.value).toEqual([
      {
        key: product.id,
        product,
        productId: product.id,
        quantity: 2,
        total: product.price * 2,
      },
    ]);
    expect(cart.total.value).toBe(product.price * 2);
  });

  it("borne les quantités et retire un article à zéro", () => {
    const product = classicProduct;

    cart.setQuantity(product.id, 99);
    expect(cart.quantityFor(product.id)).toBe(48);

    cart.setQuantity(product.id, 0);
    expect(cart.count.value).toBe(0);
    expect(cart.enrichedItems.value).toEqual([]);
  });

  it("calcule la progression et la validité de chaque catégorie contrainte", () => {
    const product = classicProduct;

    cart.setQuantity(product.id, 13);

    expect(cart.categoryCompositions.value).toContainEqual({
      categoryId: "cookies",
      categoryLabel: "Cookies",
      quantity: 13,
      requiredQuantity: 24,
      isValid: false,
    });
    expect(cart.isCompositionValid.value).toBe(false);

    cart.setQuantity(product.id, 12);

    expect(cart.categoryCompositions.value[0]).toMatchObject({
      quantity: 12,
      requiredQuantity: 12,
      isValid: true,
    });
    expect(cart.isCompositionValid.value).toBe(true);
  });

  it("partage le même état entre les utilisations du composable", () => {
    const product = classicProduct;
    const anotherCart = useCart();

    cart.setQuantity(product.id, 3);

    expect(anotherCart.count.value).toBe(3);
    expect(anotherCart.quantityFor(product.id)).toBe(3);
  });

  it("persiste le panier et supprime le brouillon au nettoyage", () => {
    const product = classicProduct;

    cart.setQuantity(product.id, 2);
    expect(JSON.parse(localStorage.getItem("cookids:cart") ?? "[]")).toEqual({
      items: [{ productId: product.id, quantity: 2 }],
      mode: "individual",
      participants: [],
    });

    cart.clear();
    expect(localStorage.getItem("cookids:cart")).toBeNull();
  });

  it("ajoute les financiers par groupes de 10 au prix unitaire", () => {
    cart.setQuantity(financierProduct.id, 1);
    expect(cart.quantityFor(financierProduct.id)).toBe(0);

    cart.setQuantity(financierProduct.id, 10);
    expect(cart.quantityFor(financierProduct.id)).toBe(10);
    expect(cart.total.value).toBe(5);
  });

  it("conserve séparément plusieurs compositions et regroupe les boîtes identiques", () => {
    cart.addCustomizedProduct(customProduct.id, ["chocolat-noir"]);
    cart.addCustomizedProduct(customProduct.id, ["noix-pecan", "chocolat-lait"]);
    cart.addCustomizedProduct(customProduct.id, ["chocolat-noir"]);

    expect(cart.enrichedItems.value).toHaveLength(2);
    expect(cart.enrichedItems.value.map(({ quantity }) => quantity)).toEqual([24, 12]);
    expect(cart.enrichedItems.value.map(({ toppingLabels }) => toppingLabels)).toEqual([
      ["Chocolat noir"],
      ["Chocolat au lait", "Noix de pécan"],
    ]);
    expect(cart.count.value).toBe(36);
    expect(cart.total.value).toBe(54);
  });

  it("répartit une commande entre participants puis fusionne le panier en mode individuel", () => {
    cart.setQuantity(classicProduct.id, 5);
    cart.enableGroupedOrder();
    const firstParticipantId = cart.activeParticipantId.value!;
    cart.updateParticipantLabel(firstParticipantId, "Camille");

    cart.addParticipant();
    const secondParticipantId = cart.activeParticipantId.value!;
    cart.updateParticipantLabel(secondParticipantId, "Bureau");
    cart.setQuantity(classicProduct.id, 7);

    expect(cart.enrichedItems.value.map(({ participantLabel, quantity }) => ({ participantLabel, quantity }))).toEqual([
      { participantLabel: "Camille", quantity: 5 },
      { participantLabel: "Bureau", quantity: 7 },
    ]);
    expect(cart.categoryCompositions.value[0]).toMatchObject({ quantity: 12, isValid: true });
    expect(cart.hasValidParticipantLabels.value).toBe(true);

    cart.disableGroupedOrder();

    expect(cart.isGrouped.value).toBe(false);
    expect(cart.quantityFor(classicProduct.id)).toBe(12);
    expect(cart.enrichedItems.value).toHaveLength(1);
  });

  it("exige un libellé pour tous les participants", () => {
    cart.enableGroupedOrder();
    expect(cart.hasValidParticipantLabels.value).toBe(false);
    cart.updateParticipantLabel(cart.activeParticipantId.value!, "Camille");
    expect(cart.hasValidParticipantLabels.value).toBe(true);
    cart.addParticipant();
    expect(cart.hasValidParticipantLabels.value).toBe(false);
    cart.updateParticipantLabel(cart.activeParticipantId.value!, "camille");
    expect(cart.hasValidParticipantLabels.value).toBe(false);
  });

});
