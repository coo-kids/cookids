import { compile } from "@tsed/schema";
import { validate } from "@tsed/ajv";
import { describe, expect, it } from "vitest";
import { GitHubBoardsSchema } from "./GitHubBoardsSchema.js";
import { loadGitHubBoards } from "./loadGitHubBoards.js";

describe("GitHubBoardsSchema", () => {
  it("compile son schéma Ts.ED", () => {
    expect(compile(GitHubBoardsSchema)).toMatchInlineSnapshot(`
      {
        "properties": {
          "assignee": {
            "minLength": 1,
            "type": "string",
          },
          "fields": {
            "properties": {
              "email": {
                "minLength": 1,
                "type": "string",
              },
              "firstName": {
                "minLength": 1,
                "type": "string",
              },
              "lastName": {
                "minLength": 1,
                "type": "string",
              },
              "location": {
                "minLength": 1,
                "type": "string",
              },
              "phoneNumber": {
                "minLength": 1,
                "type": "string",
              },
              "status": {
                "minLength": 1,
                "type": "string",
              },
              "targetDate": {
                "minLength": 1,
                "type": "string",
              },
              "totalCookies": {
                "minLength": 1,
                "type": "string",
              },
              "totalPrice": {
                "minLength": 1,
                "type": "string",
              },
            },
            "required": [
              "firstName",
              "lastName",
              "email",
              "phoneNumber",
              "location",
              "targetDate",
              "totalPrice",
              "totalCookies",
              "status",
            ],
            "type": "object",
          },
          "issueType": {
            "minLength": 1,
            "type": "string",
          },
          "owner": {
            "minLength": 1,
            "type": "string",
          },
          "projectId": {
            "minLength": 1,
            "type": "string",
          },
          "repository": {
            "minLength": 1,
            "type": "string",
          },
          "statuses": {
            "properties": {
              "pending": {
                "minLength": 1,
                "type": "string",
              },
            },
            "required": [
              "pending",
            ],
            "type": "object",
          },
        },
        "required": [
          "repository",
          "owner",
          "projectId",
          "assignee",
          "fields",
          "statuses",
          "issueType",
        ],
        "type": "object",
      }
    `);
  });

  it("charge l'identifiant totalCookies depuis la configuration", async () => {
    const settings = await loadGitHubBoards();
    expect(settings.fields.totalCookies).toBe("IFN_kgDOAsrNmQ");
  });

  it("rejette une configuration sans totalCookies", async () => {
    const settings = await loadGitHubBoards();
    const { totalCookies, ...fields } = settings.fields;
    await expect(validate({ ...settings, fields }, { type: GitHubBoardsSchema })).rejects.toThrow();
  });
});
