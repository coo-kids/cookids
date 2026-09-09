import "reflect-metadata";
import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { OrderItem } from "./OrderItem.js";

describe("OrderItem", () => {
  it("compile son modèle Ts.ED", () => {
    expect(compile(OrderItem)).toMatchInlineSnapshot(`
      {
        "properties": {
          "productId": {
            "minLength": 1,
            "type": "string",
          },
          "productName": {
            "minLength": 1,
            "type": "string",
          },
          "quantity": {
            "minimum": 1,
            "multipleOf": 1,
            "type": "integer",
          },
          "totalCents": {
            "minimum": 0,
            "multipleOf": 1,
            "type": "integer",
          },
          "unitprice": {
            "minimum": 0,
            "multipleOf": 1,
            "type": "integer",
          },
        },
        "required": [
          "productId",
          "productName",
          "unitprice",
          "quantity",
          "totalCents",
        ],
        "type": "object",
      }
    `);
  });
});
