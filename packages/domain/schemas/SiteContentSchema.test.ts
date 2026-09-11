import { validate } from "@tsed/ajv";
import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { SiteContentSchema, SocialLinkSchema } from "./SiteContentSchema.js";

describe("SiteContentSchema", () => {
  it("compile son schéma Ts.ED", () => {
    expect(compile(SiteContentSchema)).toMatchInlineSnapshot(`
      {
        "properties": {
          "brand": {
            "maxLength": 80,
            "minLength": 1,
            "type": "string",
          },
          "catalogTitle": {
            "maxLength": 160,
            "minLength": 1,
            "type": "string",
          },
          "cookiesNote": {
            "maxLength": 300,
            "minLength": 1,
            "type": "string",
          },
          "footer": {
            "maxLength": 240,
            "minLength": 1,
            "type": "string",
          },
          "heroText": {
            "maxLength": 500,
            "minLength": 1,
            "type": "string",
          },
          "heroTitle": {
            "maxLength": 240,
            "minLength": 1,
            "type": "string",
          },
          "intro": {
            "maxLength": 500,
            "minLength": 1,
            "type": "string",
          },
          "orderTitle": {
            "maxLength": 160,
            "minLength": 1,
            "type": "string",
          },
          "socialLinks": {
            "default": [],
            "items": {
              "properties": {
                "href": {
                  "format": "url",
                  "maxLength": 2048,
                  "minLength": 1,
                  "pattern": "^https:\\/\\/",
                  "type": "string",
                },
                "icon": {
                  "enum": [
                    "Instagram",
                    "MessageCircle",
                    "Facebook",
                    "Youtube",
                    "Mail",
                    "Phone",
                    "Send",
                  ],
                  "minLength": 1,
                  "type": "string",
                },
                "title": {
                  "maxLength": 160,
                  "minLength": 1,
                  "type": "string",
                },
              },
              "required": [
                "icon",
                "title",
                "href",
              ],
              "type": "object",
            },
            "type": "array",
          },
        },
        "required": [
          "brand",
          "intro",
          "heroTitle",
          "heroText",
          "catalogTitle",
          "cookiesNote",
          "orderTitle",
          "footer",
        ],
        "type": "object",
      }
    `);
  });

  it("accepte les liens sociaux HTTPS pris en charge", async () => {
    await expect(validate({
      icon: "Instagram",
      title: "Suivre Cookids sur Instagram",
      href: "https://www.instagram.com/cookids"
    }, { type: SocialLinkSchema })).resolves.toMatchObject({
      icon: "Instagram",
      title: "Suivre Cookids sur Instagram",
      href: "https://www.instagram.com/cookids"
    });
  });

  it("rejette un lien social incomplet, non pris en charge ou non sécurisé", async () => {
    await expect(validate({
      icon: "TikTok",
      title: "Suivre Cookids sur TikTok",
      href: "http://www.tiktok.com/cookids"
    }, { type: SocialLinkSchema })).rejects.toThrow();
    await expect(validate({
      icon: "Instagram",
      href: "https://www.instagram.com/cookids"
    }, { type: SocialLinkSchema })).rejects.toThrow();
  });
});
