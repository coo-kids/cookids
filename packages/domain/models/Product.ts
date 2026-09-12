import { Minimum, Property, Required } from "@tsed/schema";

export class ProductIngredient {
  @Property()
  @Required()
  label!: string;

  @Property()
  @Required()
  is_allergen!: boolean;
}

export class Product {
  @Property()
  @Required()
  id!: string;

  @Property()
  @Required()
  name!: string;

  @Property()
  @Required()
  description!: string;

  @Property(() => ProductIngredient)
  @Required()
  ingredients!: ProductIngredient[];

  @Property()
  @Required()
  @Minimum(1)
  price!: number;

  @Property()
  @Required()
  image!: string;

  @Property()
  @Required()
  category!: string;

  @Property()
  @Required()
  unitLabel!: string;
}
