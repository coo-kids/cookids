import { Email, MaxLength, Property, Required } from "@tsed/schema";
import { OnDeserialize } from "@tsed/json-mapper";

const Trim =   OnDeserialize((value?: string) => value?.trim())

export class OrderCustomer {
  @Property()
  @Required()
  @MaxLength(100)
  @Trim
  firstName!: string;

  @Property()
  @MaxLength(100)
  @Trim
  lastName?: string;

  @Property()
  @Required()
  @Email()
  @MaxLength(254)
  @OnDeserialize((value?: string) => value?.trim().toLowerCase())
  email!: string;

  @Property()
  @MaxLength(30)
  @Trim
  phoneNumber?: string;
}
