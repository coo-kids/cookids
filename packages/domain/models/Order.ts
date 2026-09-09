import { CollectionOf, Enum, Integer, Minimum, Property, Required } from "@tsed/schema";
import { OrderCustomer } from "./OrderCustomer.js";
import { OrderItem } from "./OrderItem.js";

export class Order {
  @Property()
  @Required()
  id!: string;

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
  @Integer()
  @Minimum(0)
  totalCents!: number;

  @Property()
  comment?: string;

  @Property()
  @Required()
  @Enum("new")
  status!: "new";
}
