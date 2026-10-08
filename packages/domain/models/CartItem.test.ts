import "reflect-metadata";
import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { CartItem } from "./CartItem.js";

describe("CartItem", () => {
  it("compile son modèle Ts.ED", () => {
    expect(compile(CartItem)).toMatchInlineSnapshot(`
      {
        "properties": {
          "participantId": {
            "type": "string",
          },
          "productId": {
            "minLength": 1,
            "type": "string",
          },
          "quantity": {
            "maximum": 48,
            "minimum": 1,
            "multipleOf": 1,
            "type": "integer",
          },
          "toppingIds": {
            "items": {
              "type": "string",
            },
            "type": "array",
          },
        },
        "required": [
          "productId",
          "quantity",
        ],
        "type": "object",
      }
    `);
  });
});
