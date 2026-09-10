import "reflect-metadata";
import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { OrderItem } from "./OrderItem.js";
import type { Product } from "./Product.js";

describe("OrderItem", () => {
  it("compile son modèle Ts.ED", () => {
    expect(compile(OrderItem, { groups: ["response"] })).toMatchInlineSnapshot(`
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
            "maximum": 48,
            "minimum": 1,
            "multipleOf": 1,
            "type": "integer",
          },
          "total": {
            "minimum": 0,
            "type": "number",
          },
          "unitPrice": {
            "minimum": 0,
            "type": "number",
          },
        },
        "required": [
          "productId",
          "productName",
          "unitPrice",
          "quantity",
          "total",
        ],
        "type": "object",
      }
    `);
  });

  it("valorise la ligne avec son produit", () => {
    const item = new OrderItem();
    item.productId = "cookie-cafe-noix";
    item.quantity = 2;

    item.setProduct({
      id: "cookie-cafe-noix",
      name: "Cookie café & noix",
      price: 1.5
    } as Product);

    expect(item).toMatchObject({
      productName: "Cookie café & noix",
      unitPrice: 1.5,
      total: 3
    });
  });
});
