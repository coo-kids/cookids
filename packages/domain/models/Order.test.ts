import "reflect-metadata";
import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { Order } from "./Order.js";

describe("Order", () => {
  it("compile son modèle Ts.ED", () => {
    expect(compile(Order, { groups: ["response"] })).toMatchInlineSnapshot(`
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
              "firstName": {
                "maxLength": 100,
                "minLength": 1,
                "type": "string",
              },
              "lastName": {
                "maxLength": 100,
                "type": "string",
              },
              "phoneNumber": {
                "maxLength": 30,
                "type": "string",
              },
            },
            "required": [
              "firstName",
              "email",
            ],
            "type": "object",
          },
          "OrderItemResponse": {
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
              "unitLabel": {
                "minLength": 1,
                "type": "string",
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
              "unitLabel",
              "quantity",
              "total",
            ],
            "type": "object",
          },
        },
        "properties": {
          "createdAt": {
            "minLength": 1,
            "type": "string",
          },
          "customer": {
            "$ref": "#/definitions/OrderCustomer",
          },
          "deliveryComment": {
            "maxLength": 500,
            "type": "string",
          },
          "deliveryLocation": {
            "maxLength": 120,
            "minLength": 1,
            "type": "string",
          },
          "id": {
            "type": "number",
          },
          "items": {
            "items": {
              "$ref": "#/definitions/OrderItemResponse",
            },
            "minItems": 1,
            "type": "array",
          },
          "status": {
            "enum": [
              "new",
            ],
            "minLength": 1,
            "type": "string",
          },
          "targetDeliveryDate": {
            "type": "string",
          },
          "total": {
            "minimum": 0,
            "type": "number",
          },
        },
        "required": [
          "createdAt",
          "customer",
          "items",
          "total",
          "deliveryLocation",
          "status",
        ],
        "type": "object",
      }
    `);
  });
});
