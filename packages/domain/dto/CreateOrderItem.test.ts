import "reflect-metadata";
import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { CreateOrderItem } from "./CreateOrderItem.js";

describe("CreateOrderItem", () => {
  it("compile son DTO Ts.ED", () => {
    expect(compile(CreateOrderItem)).toMatchInlineSnapshot(`
      {
        "properties": {
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
