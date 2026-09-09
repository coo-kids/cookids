import { beforeEach, describe, expect, it, vi } from "vitest";
import { injector } from "@tsed/di";

const issueCreate = vi.fn().mockResolvedValue({ data: { node_id: "issue-node-id", number: 42 } });
const graphql = vi.fn()
  .mockResolvedValueOnce({})
  .mockResolvedValueOnce({})
  .mockResolvedValueOnce({ addProjectV2ItemById: { item: { id: "project-item-id" } } })
  .mockResolvedValueOnce({});

vi.mock("octokit", () => ({
  Octokit: class {
    rest = { issues: { create: issueCreate } };
    graphql = graphql;
  }
}));

describe("GitHubOrderRepository", () => {
  beforeEach(() => {
    issueCreate.mockClear();
    graphql.mockClear();
    graphql.mockResolvedValueOnce({}).mockResolvedValueOnce({}).mockResolvedValueOnce({ addProjectV2ItemById: { item: { id: "project-item-id" } } }).mockResolvedValueOnce({});
    injector().settings.set("envs", {
      GITHUB_TOKEN: "test-token",
      GITHUB_COMMANDS_OWNER: "coo-kids",
      GITHUB_COMMANDS_ASSIGNEE: "syline",
      GITHUB_COMMANDS_REPOSITORY: "cookids-commands",
      GITHUB_COMMANDS_PROJECT_ID: "project-id",
      GITHUB_STATUS_FIELD_ID: "status-field-id",
      GITHUB_STATUS_PENDING_OPTION_ID: "pending-option-id"
      ,GITHUB_COMMANDS_ISSUE_TYPE_ID: "commands-type-id"
      ,GITHUB_LOCATION_ROSA_PARKS_OPTION_ID: "rosa-parks-option-id"
    });
  });

  it("crée l'issue, l'ajoute au projet et définit son statut initial", async () => {
    const { GitHubOrderRepository } = await import("./GitHubOrderRepository.js");
    const repository = new GitHubOrderRepository();

    await repository.save({
      createdAt: new Date(),
      customer: { firstName: "Camille", email: "camille@example.com" },
      deliveryLocation: "rosa-parks",
      items: [{ productId: "cookie", productName: "Cookie", unitPrice: 3.5, quantity: 2, total: 7 }],
      total: 7,
      status: "new"
    });

    expect(issueCreate).toHaveBeenCalledWith(expect.objectContaining({
      owner: "coo-kids",
      repo: "cookids-commands",
      assignees: ["syline"],
      title: "Commande - Camille - 7,00 €",
      body: expect.stringContaining("**Total : 7.00 €**")
    }));
    expect(graphql).toHaveBeenNthCalledWith(1, expect.stringContaining("updateIssueIssueType"), expect.objectContaining({ issueId: "issue-node-id" }));
    expect(graphql).toHaveBeenNthCalledWith(2, expect.stringContaining("setIssueFieldValue"), expect.objectContaining({ issueId: "issue-node-id" }));
    expect(graphql).toHaveBeenNthCalledWith(3, expect.stringContaining("addProjectV2ItemById"), { projectId: "project-id", contentId: "issue-node-id" });
    expect(graphql).toHaveBeenNthCalledWith(4, expect.stringContaining("updateProjectV2ItemFieldValue"), expect.objectContaining({ optionId: "pending-option-id" }));
  });
});
