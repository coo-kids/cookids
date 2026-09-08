import { BadRequest } from "@tsed/exceptions";

export class OrderValidationError extends BadRequest {
  readonly code = "INVALID_ORDER";

  constructor(message = "La commande n'est pas valide.") {
    super(message);
  }
}
