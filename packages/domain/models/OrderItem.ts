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
  @Minimum(0)
  unitPrice!: number;

  @Property()
  @Required()
  @Integer()
  @Minimum(1)
  quantity!: number;

  @Property()
  @Required()
  @Minimum(0)
  total!: number;
}
