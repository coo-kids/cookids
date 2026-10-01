import { s } from "@tsed/schema";

export const ContentProductCategorySchema = s.object({
  id: s.string().maxLength(80).required(),
  label: s.string().maxLength(120).required(),
  quantityMultiple: s.number().integer().minimum(1).optional(),
  countsAsCookies: s.boolean(),
});

export type ContentProductCategory = Omit<
  s.infer<typeof ContentProductCategorySchema>,
  "quantityMultiple" | "countsAsCookies"
> & {
  quantityMultiple?: number;
  countsAsCookies?: boolean;
};
