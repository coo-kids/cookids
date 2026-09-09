import "reflect-metadata";
import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { OrderCustomer } from "./OrderCustomer.js";

describe("OrderCustomer", () => {
  it("compile son modèle Ts.ED", () => {
    expect(compile(OrderCustomer)).toMatchInlineSnapshot(`
      {
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
      }
    `);
  });
});
