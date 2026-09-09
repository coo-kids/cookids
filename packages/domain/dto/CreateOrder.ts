import { CollectionOf, Email, MaxLength, MinItems, Property, Required } from "@tsed/schema";
import { CreateOrderItem } from "./CreateOrderItem.js";

export class CreateOrder {
  @Property()
  @Required()
  @MaxLength(100)
  name!: string;

  @Property()
  @Required()
  @Email()
  @MaxLength(254)
  email!: string;

  @Property()
  @MaxLength(30)
  phone?: string;

  @Property()
  @MaxLength(600)
  comment?: string;

  @Property()
  @Required()
  @CollectionOf(CreateOrderItem)
  @MinItems(1)
  items!: CreateOrderItem[];
}
