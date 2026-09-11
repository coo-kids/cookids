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

});
