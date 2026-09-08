import { Integer, Maximum, Minimum, Property, Required } from "@tsed/schema";

export class CreateOrderItem {
  @Property()
  @Required()
  productId!: string;

  @Property()
  @Required()
  @Integer()
  @Minimum(1)
  @Maximum(48)
  quantity!: number;
}
