import { s } from "@tsed/schema";
import { ContentProductCategorySchema } from "./ContentProductCategorySchema.js";
import { ContentProductSchema, type ContentProduct } from "./ContentProductSchema.js";

export const ContentCatalogSchema = s.object({
  categories: s.array(ContentProductCategorySchema).minItems(1).required(),
  products: s.array(ContentProductSchema).minItems(1).required()
});

export type ContentCatalog = Omit<s.infer<typeof ContentCatalogSchema>, "products"> & {
  products: ContentProduct[];
};
