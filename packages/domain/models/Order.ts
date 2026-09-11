import { OnDeserialize } from "@tsed/json-mapper";
import { CollectionOf, Enum, ForwardGroups, Groups, MaxLength, MinItems, Minimum, Property, Required } from "@tsed/schema";
import { OrderCustomer } from "./OrderCustomer.js";
import { OrderItem } from "./OrderItem.js";

export class Order {
  @Property()
  @Groups("!create")
  id?: number;

  @Property()
  @Required()
  @Groups("!create")
  createdAt: Date = new Date();

  @Property(OrderCustomer)
  @Required()
  customer!: OrderCustomer;

  @Property()
  @Required()
  @CollectionOf(OrderItem)
  @MinItems(1)
  @ForwardGroups()
  items!: OrderItem[];

  @Property()
  @Required()
  @Minimum(0)
  @Groups("!create")
  get total(): number {
    return this.items.reduce((total, item) => total + item.total, 0)
  }

  @Property()
  @Required()
  @MaxLength(120)
  deliveryLocation!: string;

  @Property(Date)
  targetDeliveryDate?: Date;

  @Property()
  @MaxLength(500)
  @OnDeserialize((value?: string) => value?.trim())
  deliveryComment?: string;

  @Property()
  @Required()
  @Enum("new")
  @Groups("!create")
  status: "new" = "new";
}
