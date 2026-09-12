import { s } from "@tsed/schema";

export const ContentProductCategorySchema = s.object({
  id: s.string().maxLength(80).required(),
  label: s.string().maxLength(120).required(),
  quantityMultiple: s.number().integer().minimum(1).optional(),
});

export type ContentProductCategory = s.infer<typeof ContentProductCategorySchema>;
