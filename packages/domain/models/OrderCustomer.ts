import { Email, MaxLength, Property, Required } from "@tsed/schema";

export class OrderCustomer {
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
}
