import { Enum, Integer, Minimum, Property, Required } from "@tsed/schema";

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

  @Property()
  @Required()
  ingredients!: string;

  @Property()
  @Required()
  @Integer()
  @Minimum(1)
  priceCents!: number;

  @Property()
  @Required()
  image!: string;

  @Property()
  @Required()
  @Enum("cookies", "other")
  category!: "cookies" | "other";

  @Property()
  @Required()
  unitLabel!: string;
}
