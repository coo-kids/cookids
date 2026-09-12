import { s } from "@tsed/schema";
import { ContentProductCategorySchema } from "./ContentProductCategorySchema.js";
import { ContentProductSchema } from "./ContentProductSchema.js";

export const ContentCatalogSchema = s.object({
  categories: s.array(ContentProductCategorySchema).minItems(1).required(),
  products: s.array(ContentProductSchema).minItems(1).required()
});

export type ContentCatalog = s.infer<typeof ContentCatalogSchema>;
