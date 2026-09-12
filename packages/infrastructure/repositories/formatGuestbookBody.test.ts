import { describe, expect, it } from "vitest";
import { formatGuestbookBody, parseGuestbookBody } from "./formatGuestbookBody.js";
describe("guestbook body", () => {
  it("échappe HTML, Markdown et mentions sans perdre le texte", () => {
    const entry = { author: "**@Alice**", comment: '<script>alert(1)</script>\n[cliquer](javascript:alert(1)) & @everyone' };
    const body = formatGuestbookBody(entry);
    expect(body).not.toContain("<script>");
    expect(body).not.toContain("@everyone");
    expect(parseGuestbookBody(body)).toEqual(entry);
  });
  it("ignore les corps invalides", () => {
    expect(parseGuestbookBody("un avis bidon")).toBeNull();
    expect(parseGuestbookBody(formatGuestbookBody({ author: "", comment: "test" }))).toBeNull();
  });
});
