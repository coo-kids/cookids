import "reflect-metadata";
import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { Order } from "./Order.js";

describe("Order", () => {
  it("compile son modèle Ts.ED", () => {
    expect(compile(Order)).toMatchInlineSnapshot(`
      {
        "definitions": {
          "OrderCustomer": {
            "properties": {
              "email": {
                "format": "email",
                "maxLength": 254,
                "minLength": 1,
                "type": "string",
              },
              "name": {
                "maxLength": 100,
                "minLength": 1,
                "type": "string",
              },
              "phone": {
                "maxLength": 30,
                "type": "string",
              },
            },
            "required": [
              "name",
              "email",
            ],
            "type": "object",
          },
          "OrderItem": {
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
          },
        },
        "properties": {
          "comment": {
            "type": "string",
          },
          "createdAt": {
            "minLength": 1,
            "type": "string",
          },
          "customer": {
            "$ref": "#/definitions/OrderCustomer",
          },
          "id": {
            "minLength": 1,
            "type": "string",
          },
          "items": {
            "items": {
              "$ref": "#/definitions/OrderItem",
            },
            "type": "array",
          },
          "status": {
            "enum": [
              "new",
            ],
            "minLength": 1,
            "type": "string",
          },
          "totalCents": {
            "minimum": 0,
            "multipleOf": 1,
            "type": "integer",
          },
        },
        "required": [
          "id",
          "createdAt",
          "customer",
          "items",
          "totalCents",
          "status",
        ],
        "type": "object",
      }
    `);
  });
});
