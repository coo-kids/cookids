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
          "deliveryLocation": {
            "minLength": 1,
            "type": "string",
          },
          "id": {
            "type": "number",
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
