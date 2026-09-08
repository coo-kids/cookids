export interface ContentProduct {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  price: number;
  image: string;
  category: "cookies" | "other";
  unitLabel: string;
}
