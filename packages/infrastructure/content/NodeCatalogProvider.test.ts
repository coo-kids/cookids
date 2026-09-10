import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { NodeCatalogProvider } from "./NodeCatalogProvider.js";

vi.mock("node:fs/promises", () => ({ readFile: vi.fn() }));

const catalogSource = JSON.stringify({
  products: [{
    id: "cookie-cafe-noix",
    name: "Cookie café & noix",
    description: "Moelleux",
    ingredients: [{ label: "Farine", is_allergen: true }, { label: "café", is_allergen: false }, { label: "noix", is_allergen: true }],
    price: 2.5,
    image: "/images/cookie-cafe-noix.jpg",
    category: "cookies",
    unitLabel: "à l'unité",
  }],
});

describe("NodeCatalogProvider", () => {
  it("valide le catalogue en euros et le met en cache", async () => {
    vi.mocked(readFile).mockResolvedValue(catalogSource);
    const provider = new NodeCatalogProvider();

    const [first, second] = await Promise.all([provider.getProducts(), provider.getProducts()]);

    expect(first).toEqual([JSON.parse(catalogSource).products[0]]);
    expect(second).toBe(first);
    expect(readFile).toHaveBeenCalledTimes(1);
  });
});
