import { describe, expect, it, vi } from "vitest";
import type { Octokit } from "octokit";
import { loadGitHubBoards } from "../config/loadGitHubBoards.js";
import { countSoldCookies } from "./countSoldCookies.js";

const connection = <T>(nodes: T[], after: string | null = null) => ({ nodes, pageInfo: { hasNextPage: after !== null, endCursor: after } });

async function setup() {
  const boards = await loadGitHubBoards();
  const graphql = vi.fn();
  const client = { graphql } as unknown as Pick<Octokit, "graphql">;
  const completed = (projectId = boards.projectId, fieldId = boards.fields.status, optionId = boards.statuses.completed) => ({
    id: "item", project: { id: projectId }, fieldValues: connection([{ field: { id: fieldId }, optionId }]),
  });
  const cookies = (value: number) => ({ field: { id: boards.fields.totalCookies }, value });
  return { boards, graphql, client, completed, cookies };
}

describe("countSoldCookies", () => {
  it("additionne plusieurs pages sans doublons et inclut les éléments archivés", async () => {
    const { boards, graphql, client, completed, cookies } = await setup();
    graphql
      .mockResolvedValueOnce({ repository: { issues: connection([{ id: "a" }], "next") } })
      .mockResolvedValueOnce({ node: { projectItems: connection([completed()]) } })
      .mockResolvedValueOnce({ node: { issueFieldValues: connection([cookies(24)]) } })
      .mockResolvedValueOnce({ repository: { issues: connection([{ id: "a" }, { id: "b" }]) } })
      .mockResolvedValueOnce({ node: { projectItems: connection([completed()]) } })
      .mockResolvedValueOnce({ node: { issueFieldValues: connection([cookies(12)]) } });
    await expect(countSoldCookies(client, boards)).resolves.toBe(36);
    expect(graphql.mock.calls[1][0]).toContain("includeArchived: true");
    expect(graphql.mock.calls[3][1].after).toBe("next");
  });

  it("exclut les mauvais projets, champs et statuts", async () => {
    const { boards, graphql, client, completed } = await setup();
    graphql
      .mockResolvedValueOnce({ repository: { issues: connection([{ id: "a" }]) } })
      .mockResolvedValueOnce({ node: { projectItems: connection([
        completed("other-project"), completed(boards.projectId, "other-field"),
        completed(boards.projectId, boards.fields.status, boards.statuses.pending),
      ]) } });
    await expect(countSoldCookies(client, boards)).resolves.toBe(0);
    expect(graphql).toHaveBeenCalledTimes(2);
  });

  it("pagine les projets, leurs champs et les champs d'issue", async () => {
    const { boards, graphql, client, completed, cookies } = await setup();
    graphql
      .mockResolvedValueOnce({ repository: { issues: connection([{ id: "a" }]) } })
      .mockResolvedValueOnce({ node: { projectItems: connection([], "projects-next") } })
      .mockResolvedValueOnce({ node: { projectItems: connection([{ ...completed(), fieldValues: connection([], "status-next") }]) } })
      .mockResolvedValueOnce({ node: { fieldValues: completed().fieldValues } })
      .mockResolvedValueOnce({ node: { issueFieldValues: connection([{ field: { id: "other-number" }, value: 100 }], "fields-next") } })
      .mockResolvedValueOnce({ node: { issueFieldValues: connection([cookies(0)]) } });
    await expect(countSoldCookies(client, boards)).resolves.toBe(0);
    expect(graphql.mock.calls[2][1].after).toBe("projects-next");
    expect(graphql.mock.calls[3][1].after).toBe("status-next");
    expect(graphql.mock.calls[5][1].after).toBe("fields-next");
  });

  it.each([undefined, -1, 1.5, NaN])("échoue si une commande terminée a un total manquant ou invalide (%s)", async (value) => {
    const { boards, graphql, client, completed, cookies } = await setup();
    graphql
      .mockResolvedValueOnce({ repository: { issues: connection([{ id: "a" }]) } })
      .mockResolvedValueOnce({ node: { projectItems: connection([completed()]) } })
      .mockResolvedValueOnce({ node: { issueFieldValues: connection(value === undefined ? [] : [cookies(value)]) } });
    await expect(countSoldCookies(client, boards)).rejects.toThrow(/totalCookies/);
  });

  it("échoue en cas d'erreur GitHub", async () => {
    const { boards, graphql, client } = await setup();
    graphql.mockRejectedValueOnce(new Error("API indisponible"));
    await expect(countSoldCookies(client, boards)).rejects.toThrow("API indisponible");
  });

  it("renvoie 0 pour un dépôt sans commandes", async () => {
    const { boards, graphql, client } = await setup();
    graphql.mockResolvedValueOnce({ repository: { issues: connection([]) } });
    await expect(countSoldCookies(client, boards)).resolves.toBe(0);
  });
});
