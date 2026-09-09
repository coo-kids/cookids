import { afterEach, describe, expect, it, vi } from "vitest";
import { BunCatalogProvider } from "./BunCatalogProvider.js";

const catalogSource = JSON.stringify({
  products: [{
    id: "cookie-cafe-noix",
    name: "Cookie café & noix",
    description: "Moelleux",
    ingredients: "Farine, café, noix",
    price: 2.5,
    image: "/images/cookie-cafe-noix.jpg",
    category: "cookies",
    unitLabel: "à l'unité"
  }]
});

describe("BunCatalogProvider", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("valide le catalogue, convertit les prix en centimes et le met en cache", async () => {
    const file = vi.fn(() => ({ text: vi.fn().mockResolvedValue(catalogSource) }));
    vi.stubGlobal("Bun", { file });
    const provider = new BunCatalogProvider();

    const [first, second] = await Promise.all([provider.getProducts(), provider.getProducts()]);

    expect(first).toEqual([{ ...JSON.parse(catalogSource).products[0], priceCents: 250 }]);
    expect(second).toBe(first);
    expect(file).toHaveBeenCalledTimes(1);
  });
});
