import { Email, MaxLength, Property, Required } from "@tsed/schema";

export class OrderCustomer {
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
}
