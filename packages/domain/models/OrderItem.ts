import { Integer, Minimum, Property, Required } from "@tsed/schema";

export class OrderItem {
  @Property()
  @Required()
  productId!: string;

  @Property()
  @Required()
  productName!: string;

  @Property()
  @Required()
  @Integer()
  @Minimum(0)
  unitPriceCents!: number;

  @Property()
  @Required()
  @Integer()
  @Minimum(1)
  quantity!: number;

  @Property()
  @Required()
  @Integer()
  @Minimum(0)
  totalCents!: number;
}
