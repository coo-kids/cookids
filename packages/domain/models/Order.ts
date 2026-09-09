import { CollectionOf, Enum, Minimum, Property, Required } from "@tsed/schema";
import { OrderCustomer } from "./OrderCustomer.js";
import { OrderItem } from "./OrderItem.js";

export class Order {
  @Property()
  id?: number;

  @Property()
  @Required()
  createdAt!: Date;

  @Property(OrderCustomer)
  @Required()
  customer!: OrderCustomer;

  @Property()
  @Required()
  @CollectionOf(OrderItem)
  items!: OrderItem[];

  @Property()
  @Required()
  @Minimum(0)
  total!: number;

  @Property()
  @Property()
  @Required()
  deliveryLocation!: string;

  @Property(Date)
  targetDeliveryDate?: Date;

  @Property()
  @Required()
  @Enum("new")
  status!: "new";
}
