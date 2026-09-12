import { describe, expect, it } from "vitest";
import create from "./create.js";
import list from "./list.js";
function request(body: unknown, origin?: string) {
  return new Request("https://cookids.test/api/guestbook", { method: "POST", headers: { "content-type": "application/json", ...(origin ? { origin } : {}) }, body: JSON.stringify(body) });
}
describe("guestbook handlers", () => {
  it.each([
    { author: "", comment: "test" },
    { author: "Alice", comment: "" },
    { author: "A".repeat(81), comment: "test" },
    { author: "Alice", comment: "A".repeat(2001) },
    { author: "Alice\nBob", comment: "test" },
    { author: "Alice", comment: "test", website: "bot" },
    { author: "Alice", comment: "test", labels: ["avis-publie"] },
    { author: {}, comment: "test" }
  ])("rejette les entrées invalides sans créer d’issue", async (body) => {
    expect((await create(request(body))).status).toBe(400);
  });
  it("rejette l’origine externe et les corps trop volumineux", async () => {
    expect((await create(request({ author: "Alice", comment: "test" }, "https://evil.test"))).status).toBe(400);
    expect((await create(request({ author: "Alice", comment: "a".repeat(17000) }))).status).toBe(400);
  });
  it("accepte puis limite les soumissions rapprochées", async () => {
    expect((await create(request({ author: " Alice ", comment: " Merci ! " }))).status).toBe(201);
    expect((await create(request({ author: "Alice", comment: "Merci !" }))).status).toBe(429);
  });
  it("lit les avis sans exposer d’informations internes", async () => {
    const response = await list(new Request("https://cookids.test/api/guestbook"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ entries: [] });
  });
});
