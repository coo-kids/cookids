import { s } from "@tsed/schema";
import { ContentProductSchema } from "./ContentProductSchema";

export const ContentCatalogSchema = s.object({
  products: s.array(ContentProductSchema).minItems(1).required()
});

export type ContentCatalog = s.infer<typeof ContentCatalogSchema>;
