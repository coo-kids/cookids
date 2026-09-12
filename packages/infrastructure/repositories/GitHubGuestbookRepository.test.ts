import { beforeEach, describe, expect, it, vi } from "vitest";
import { GitHubGuestbookRepository } from "./GitHubGuestbookRepository.js";
import { formatGuestbookBody } from "./formatGuestbookBody.js";
const mocks = vi.hoisted(() => ({ paginate: vi.fn(), create: vi.fn(), graphql: vi.fn() }));
vi.mock("octokit", () => ({ Octokit: class {
  paginate = mocks.paginate;
  graphql = mocks.graphql;
  rest = { issues: { listForRepo: vi.fn(), create: mocks.create } };
} }));
vi.mock("@tsed/di", async (original) => ({
  ...await original<typeof import("@tsed/di")>(),
  constant: (key: string) => key === "envs.GITHUB_TOKEN" ? "mock-token" : { owner: "coo-kids", repository: "cookids-guest-books", issueType: "type-comments", publishedLabel: "avis-publie" }
}));
beforeEach(() => vi.clearAllMocks());
describe("GitHubGuestbookRepository", () => {
  it("ne retourne que les avis approuvés du bon type", async () => {
    const approved = { type: { node_id: "type-comments" }, labels: [{ name: "avis-publie" }], body: formatGuestbookBody({ author: "Alice", comment: "Merci" }) };
    mocks.paginate.mockResolvedValue([approved, { ...approved, labels: [] }, { ...approved, type: { node_id: "order" } }, { ...approved, pull_request: {} }, { ...approved, body: "invalid" }]);
    await expect(new GitHubGuestbookRepository().listPublished()).resolves.toEqual([{ author: "Alice", comment: "Merci" }]);
    expect(mocks.paginate.mock.calls[0][1]).toMatchObject({ labels: "avis-publie", per_page: 100, state: "all" });
  });
  it("crée une issue privée sans label d’approbation puis renseigne le type", async () => {
    mocks.create.mockResolvedValue({ data: { node_id: "issue-id" } });
    mocks.graphql.mockResolvedValue({});
    await new GitHubGuestbookRepository().save({ author: "Alice", comment: "Merci" });
    expect(mocks.create.mock.calls[0][0]).not.toHaveProperty("labels");
    expect(mocks.graphql.mock.calls[0][1]).toEqual({ issueId: "issue-id", issueTypeId: "type-comments" });
  });
  it("masque les erreurs GitHub", async () => {
    mocks.paginate.mockRejectedValue(new Error("secret-token"));
    await expect(new GitHubGuestbookRepository().listPublished()).rejects.toThrow("temporairement indisponibles");
  });
});
