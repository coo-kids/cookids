import { BadRequest } from "@tsed/exceptions";

export class UnknownProductError extends BadRequest {
  readonly code = "UNKNOWN_PRODUCT";

  constructor() {
    super("Un produit sélectionné n'existe pas.");
  }
}
