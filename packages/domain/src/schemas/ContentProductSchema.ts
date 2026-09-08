import { Enum, MaxLength, Minimum, Property, Required } from "@tsed/schema";

export class ContentProductSchema {
  @Property()
  @Required()
  @MaxLength(80)
  id!: string;

  @Property()
  @Required()
  @MaxLength(120)
  name!: string;

  @Property()
  @Required()
  @MaxLength(240)
  description!: string;

  @Property()
  @Required()
  @MaxLength(800)
  ingredients!: string;

  @Property()
  @Required()
  @Minimum(0.01)
  price!: number;

  @Property()
  @Required()
  @MaxLength(200)
  image!: string;

  @Property()
  @Required()
  @Enum("cookies", "other")
  category!: "cookies" | "other";

  @Property()
  @Required()
  @MaxLength(60)
  unitLabel!: string;
}
