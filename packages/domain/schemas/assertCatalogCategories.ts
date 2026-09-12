import type { ContentCatalog } from "./ContentCatalogSchema.js";

export function assertCatalogCategories(catalog: ContentCatalog): ContentCatalog {
  const categoryIds = new Set<string>();

  for (const category of catalog.categories) {
    if (categoryIds.has(category.id)) {
      throw new Error(`La catégorie « ${category.id} » est définie plusieurs fois.`);
    }

    categoryIds.add(category.id);
  }

  for (const product of catalog.products) {
    if (!categoryIds.has(product.category)) {
      throw new Error(`Le produit « ${product.id} » référence une catégorie inconnue.`);
    }
  }

  return catalog;
}
