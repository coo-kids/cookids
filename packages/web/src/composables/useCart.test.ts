import { beforeEach, describe, expect, it } from "vitest";
import { catalog } from "../content/catalog.js";
import { useCart } from "./useCart.js";

describe("useCart", () => {
  const cart = useCart();

  beforeEach(() => {
    cart.clear();
    cart.isCartOpen.value = false;
  });

  it("calcule les articles enrichis et le total", () => {
    const product = catalog[0];

    cart.setQuantity(product.id, 2);

    expect(cart.count.value).toBe(2);
    expect(cart.quantityFor(product.id)).toBe(2);
    expect(cart.enrichedItems.value).toEqual([
      {
        product,
        productId: product.id,
        quantity: 2,
        total: product.price * 2,
      },
    ]);
    expect(cart.total.value).toBe(product.price * 2);
  });

  it("borne les quantités et retire un article à zéro", () => {
    const product = catalog[0];

    cart.setQuantity(product.id, 99);
    expect(cart.quantityFor(product.id)).toBe(48);

    cart.setQuantity(product.id, 0);
    expect(cart.count.value).toBe(0);
    expect(cart.enrichedItems.value).toEqual([]);
  });

  it("calcule la progression et la validité de chaque catégorie contrainte", () => {
    const product = catalog[0];

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
    const product = catalog[0];
    const anotherCart = useCart();

    cart.setQuantity(product.id, 3);

    expect(anotherCart.count.value).toBe(3);
    expect(anotherCart.quantityFor(product.id)).toBe(3);
  });

});
