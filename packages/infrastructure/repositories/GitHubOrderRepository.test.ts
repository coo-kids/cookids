import { beforeEach, describe, expect, it, vi } from "vitest";
import { DITest, injector } from "@tsed/di";
import { CatalogProvider } from "@cookids/domain/catalog/CatalogProvider.js";
import type { GitHubOrderRepository as GitHubOrderRepositoryType } from "./GitHubOrderRepository.js";
import { OrderItem } from "@cookids/domain/models/OrderItem.js";

const issueCreate = vi.fn().mockResolvedValue({ data: { node_id: "issue-node-id", number: 42 } });
const octokitOptions = vi.fn();
const graphql = vi.fn();
const catalogProvider = {
  getCatalog: vi.fn().mockResolvedValue({
    categories: [],
    products: [
      { id: "cookie", category: "cookies" },
      { id: "special", category: "cookies" },
      { id: "cookie-named-financier", category: "financiers" },
    ],
  }),
};

vi.mock("octokit", () => ({
  Octokit: class {
    constructor(options: unknown) {
      octokitOptions(options);
    }

    rest = { issues: { create: issueCreate } };
    graphql = graphql;
  }
}));

describe("GitHubOrderRepository", () => {
  beforeEach(() => {
    issueCreate.mockClear();
    octokitOptions.mockClear();
    graphql.mockReset();
    graphql.mockResolvedValueOnce({}).mockResolvedValueOnce({}).mockResolvedValueOnce({ addProjectV2ItemById: { item: { id: "project-item-id" } } }).mockResolvedValueOnce({});
    injector().settings.set("envs", {
      GITHUB_TOKEN: "test-token"
    });
    injector().settings.set("githubBoards", {
      repository: "cookids-commands",
      owner: "coo-kids",
      projectId: "project-id",
      assignee: "syline",
      fields: {
        firstName: "first-name-field-id",
        lastName: "last-name-field-id",
        email: "email-field-id",
        phoneNumber: "phone-number-field-id",
        location: "location-field-id",
        targetDate: "target-date-field-id",
        totalPrice: "total-field-id",
        totalCookies: "total-cookies-field-id",
        status: "status-field-id"
      },
      statuses: { pending: "pending-option-id" },
      issueType: "commands-type-id"
    });
  });

  it("crée l'issue, l'ajoute au projet et définit son statut initial", async () => {
    const { GitHubOrderRepository } = await import("./GitHubOrderRepository.js");
    const repository = await DITest.invoke<GitHubOrderRepositoryType>(GitHubOrderRepository, [
      { token: CatalogProvider, use: catalogProvider },
    ]);

    await repository.save({
      createdAt: new Date(),
      customer: { firstName: "Camille", email: "camille@example.com" },
      deliveryLocation: "rosa-parks-option-id",
      deliveryComment: "Merci de sonner à l’arrivée",
      items: [Object.assign(new OrderItem(), { productId: "cookie", productName: "Cookie", unitPrice: 12, unitLabel: "la boîte de 12", quantity: 2 })],
      total: 24,
      status: "new"
    });

    expect(issueCreate).toHaveBeenCalledWith(expect.objectContaining({
      owner: "coo-kids",
      repo: "cookids-commands",
      assignees: ["syline"],
      title: "Commande - Camille - 24,00 €",
      body: expect.stringContaining("la boîte de 12")
    }));
    expect(issueCreate.mock.calls[0]?.[0].body).toContain("## Livraison");
    expect(issueCreate.mock.calls[0]?.[0].body).toContain("**Commentaire :** Merci de sonner à l’arrivée");
    expect(octokitOptions).toHaveBeenCalledWith(expect.objectContaining({
      request: {
        headers: {
          "X-GitHub-Api-Version": "2026-03-10"
        }
      }
    }));
    expect(graphql).toHaveBeenNthCalledWith(1, expect.stringContaining("updateIssueIssueType"), expect.objectContaining({ issueId: "issue-node-id" }));
    expect(graphql).toHaveBeenNthCalledWith(2, expect.stringContaining("setIssueFieldValue"), expect.objectContaining({ issueId: "issue-node-id" }));
    expect(graphql.mock.calls[1][1]).toMatchObject({
      issueFields: expect.arrayContaining([
        { fieldId: "first-name-field-id", textValue: "Camille" },
        { fieldId: "email-field-id", textValue: "camille@example.com" },
        { fieldId: "location-field-id", singleSelectOptionId: "rosa-parks-option-id" },
        { fieldId: "total-field-id", numberValue: 24 },
        { fieldId: "total-cookies-field-id", numberValue: 2 }
      ])
    });
    expect(graphql).toHaveBeenNthCalledWith(3, expect.stringContaining("addProjectV2ItemById"), { projectId: "project-id", contentId: "issue-node-id" });
    expect(graphql).toHaveBeenNthCalledWith(4, expect.stringContaining("updateProjectV2ItemFieldValue"), expect.objectContaining({ optionId: "pending-option-id" }));
  });

  it.each([
    { quantities: [12, 24, 10], expected: 36 },
    { quantities: [0, 0, 10], expected: 0 },
  ])("renseigne $expected cookies sans compter les autres catégories", async ({ quantities, expected }) => {
    const { GitHubOrderRepository } = await import("./GitHubOrderRepository.js");
    const repository = await DITest.invoke<GitHubOrderRepositoryType>(GitHubOrderRepository, [
      { token: CatalogProvider, use: catalogProvider },
    ]);
    const ids = ["cookie", "special", "cookie-named-financier"];
    await repository.save({
      createdAt: new Date(),
      customer: { firstName: "Camille", email: "camille@example.com" },
      deliveryLocation: "rosa-parks-option-id",
      items: ids.flatMap((productId, index) => quantities[index] ? [Object.assign(new OrderItem(), {
        productId, productName: productId, quantity: quantities[index], unitPrice: 1, unitLabel: "1 unité",
      })] : []),
      total: quantities.reduce((sum, quantity) => sum + quantity, 0),
      status: "new",
    });
    expect(graphql.mock.calls[1][1].issueFields).toContainEqual({
      fieldId: "total-cookies-field-id", numberValue: expected,
    });
  });

  it("rejette une configuration GitHub incomplète", async () => {
    injector().settings.set("envs", {});
    const { GitHubOrderRepository } = await import("./GitHubOrderRepository.js");

    const repository = await DITest.invoke<GitHubOrderRepositoryType>(GitHubOrderRepository, [
      { token: CatalogProvider, use: catalogProvider },
    ]);
    await expect(repository.save({
      createdAt: new Date(),
      customer: { firstName: "Camille", email: "camille@example.com" },
      deliveryLocation: "rosa-parks-option-id",
      items: [],
      total: 0,
      status: "new"
    })).rejects.toThrow("GitHub commands configuration is incomplete.");
  });
});
