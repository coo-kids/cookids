export interface Product {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  priceCents: number;
  image: string;
  category: "cookies" | "other";
  unitLabel: string;
}
