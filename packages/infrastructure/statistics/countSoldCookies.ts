import type { Octokit } from "octokit";
import type { GitHubBoards } from "../config/GitHubBoardsSchema.js";

interface Connection<T> {
  nodes: (T | null)[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

interface StatusValue {
  optionId?: string;
  field?: { id: string };
}

interface ProjectItem {
  id: string;
  project: { id: string };
  fieldValues: Connection<StatusValue>;
}

const issuesQuery = `query($owner: String!, $repo: String!, $after: String) {
  repository(owner: $owner, name: $repo) {
    issues(first: 100, after: $after, orderBy: {field: CREATED_AT, direction: ASC}) {
      nodes { id }
      pageInfo { hasNextPage endCursor }
    }
  }
}`;

const projectsQuery = `query($id: ID!, $after: String) {
  node(id: $id) { ... on Issue {
    projectItems(first: 100, after: $after, includeArchived: true) {
      nodes {
        id project { id }
        fieldValues(first: 100) {
          nodes { ... on ProjectV2ItemFieldSingleSelectValue { optionId field { ... on ProjectV2SingleSelectField { id } } } }
          pageInfo { hasNextPage endCursor }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  } }
}`;

const statusQuery = `query($id: ID!, $after: String) {
  node(id: $id) { ... on ProjectV2Item {
    fieldValues(first: 100, after: $after) {
      nodes { ... on ProjectV2ItemFieldSingleSelectValue { optionId field { ... on ProjectV2SingleSelectField { id } } } }
      pageInfo { hasNextPage endCursor }
    }
  } }
}`;

const cookiesQuery = `query($id: ID!, $after: String) {
  node(id: $id) { ... on Issue {
    issueFieldValues(first: 100, after: $after) {
      nodes { ... on IssueFieldNumberValue { value field { ... on Node { id } } } }
      pageInfo { hasNextPage endCursor }
    }
  } }
}`;

/** Recalcule le total des issues terminées du dépôt configuré, y compris les éléments archivés, sans données client. */
export async function countSoldCookies(client: Pick<Octokit, "graphql">, boards: GitHubBoards): Promise<number> {
  let total = 0;
  let after: string | null = null;
  const seen = new Set<string>();
  do {
    const response: { repository: { issues: Connection<{ id: string }> } | null } = await client.graphql(issuesQuery, {
      owner: boards.owner, repo: boards.repository, after,
    });
    if (!response.repository) throw new Error("Le dépôt de commandes est inaccessible.");
    for (const issue of response.repository.issues.nodes) {
      if (!issue || seen.has(issue.id)) continue;
      seen.add(issue.id);
      if (await isCompleted(client, issue.id, boards)) {
        total += await readCookies(client, issue.id, boards.fields.totalCookies);
        if (!Number.isSafeInteger(total)) throw new Error("Le total des cookies dépasse la limite autorisée.");
      }
    }
    after = nextCursor(response.repository.issues);
  } while (after);
  return total;
}

async function isCompleted(client: Pick<Octokit, "graphql">, id: string, boards: GitHubBoards): Promise<boolean> {
  let after: string | null = null;
  do {
    const response: { node: { projectItems: Connection<ProjectItem> } | null } = await client.graphql(projectsQuery, { id, after });
    if (!response.node) throw new Error("Une issue de commande est inaccessible.");
    for (const item of response.node.projectItems.nodes) {
      if (!item || item.project.id !== boards.projectId) continue;
      let values = item.fieldValues;
      while (true) {
        if (values.nodes.some((value) => value?.field?.id === boards.fields.status && value.optionId === boards.statuses.completed)) return true;
        const cursor = nextCursor(values);
        if (!cursor) break;
        const page: { node: { fieldValues: Connection<StatusValue> } | null } = await client.graphql(statusQuery, { id: item.id, after: cursor });
        if (!page.node) throw new Error("Un élément du projet est inaccessible.");
        values = page.node.fieldValues;
      }
    }
    after = nextCursor(response.node.projectItems);
  } while (after);
  return false;
}

async function readCookies(client: Pick<Octokit, "graphql">, id: string, fieldId: string): Promise<number> {
  let after: string | null = null;
  do {
    const response: { node: { issueFieldValues: Connection<{ value?: number; field?: { id: string } }> } | null } = await client.graphql(cookiesQuery, { id, after });
    if (!response.node) throw new Error("Les champs d'une commande sont inaccessibles.");
    for (const value of response.node.issueFieldValues.nodes) {
      if (value?.field?.id !== fieldId) continue;
      if (!Number.isSafeInteger(value.value) || value.value! < 0) throw new Error("Une commande terminée contient un totalCookies invalide.");
      return value.value!;
    }
    after = nextCursor(response.node.issueFieldValues);
  } while (after);
  throw new Error("Une commande terminée ne renseigne pas totalCookies. Compléter ce champ avant de relancer le comptage.");
}

function nextCursor<T>(connection: Connection<T>): string | null {
  if (!connection.pageInfo.hasNextPage) return null;
  if (!connection.pageInfo.endCursor) throw new Error("Pagination GitHub incomplète.");
  return connection.pageInfo.endCursor;
}
