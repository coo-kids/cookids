import { s } from "@tsed/schema";

export const ContentProductSchema = s.object({
  id: s.string().maxLength(80).required(),
  name: s.string().maxLength(120).required(),
  description: s.string().maxLength(240).required(),
  ingredients: s.string().maxLength(800).required(),
  price: s.number().minimum(0.01).multipleOf(0.01).required(),
  image: s.string().maxLength(200).required(),
  category: s.string().enum("cookies", "other").required(),
  unitLabel: s.string().maxLength(60).required()
});

export type ContentProduct = s.infer<typeof ContentProductSchema>;
