import "reflect-metadata";
import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { CreateOrder } from "./CreateOrder.js";

describe("CreateOrder", () => {
  it("compile son DTO Ts.ED", () => {
    expect(compile(CreateOrder)).toMatchInlineSnapshot(`
      {
        "definitions": {
          "CreateOrderItem": {
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
          },
        },
        "properties": {
          "deliveryLocation": {
            "maxLength": 80,
            "minLength": 1,
            "type": "string",
          },
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
          "items": {
            "items": {
              "$ref": "#/definitions/CreateOrderItem",
            },
            "minItems": 1,
            "type": "array",
          },
          "lastName": {
            "maxLength": 100,
            "type": "string",
          },
          "phoneNumber": {
            "maxLength": 30,
            "type": "string",
          },
          "targetDeliveryDate": {
            "type": "string",
          },
        },
        "required": [
          "firstName",
          "email",
          "deliveryLocation",
          "items",
        ],
        "type": "object",
      }
    `);
  });
});
