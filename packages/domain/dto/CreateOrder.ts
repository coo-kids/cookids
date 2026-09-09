import { CollectionOf, Email, MaxLength, MinItems, Property, Required } from "@tsed/schema";
import { CreateOrderItem } from "./CreateOrderItem.js";

export class CreateOrder {
  @Property()
  @Required()
  @MaxLength(100)
  firstName!: string;

  @Property()
  @MaxLength(100)
  lastName?: string;

  @Property()
  @Required()
  @Email()
  @MaxLength(254)
  email!: string;

  @Property()
  @MaxLength(30)
  phoneNumber?: string;

  @Property()
  @Required()
  @MaxLength(80)
  deliveryLocation!: string;

  @Property(Date)
  targetDeliveryDate?: Date;

  @Property()
  @Required()
  @CollectionOf(CreateOrderItem)
  @MinItems(1)
  items!: CreateOrderItem[];
}
