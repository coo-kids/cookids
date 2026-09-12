import { s } from "@tsed/schema";

export const ContentProductIngredientSchema = s.object({
  label: s.string().maxLength(120).required(),
  is_allergen: s.boolean().required(),
});

export const ContentProductSchema = s.object({
  id: s.string().maxLength(80).required(),
  name: s.string().maxLength(120).required(),
  description: s.string().maxLength(240).required(),
  ingredients: s.array(ContentProductIngredientSchema).required(),
  price: s.number().minimum(0.01).multipleOf(0.01).required(),
  image: s.string().maxLength(200).required(),
  category: s.string().maxLength(80).required(),
  unitLabel: s.string().maxLength(60).required(),
  is_limited_edition: s.boolean(),
});

export type ContentProductIngredient = s.infer<
  typeof ContentProductIngredientSchema
>;

export type ContentProduct = Omit<s.infer<typeof ContentProductSchema>, "is_limited_edition"> & {
  is_limited_edition?: boolean;
};
