import { constant, Injectable } from "@tsed/di";
import { Octokit } from "octokit";
import { ServiceUnavailable } from "@tsed/exceptions";
import { GuestbookRepository } from "@cookids/domain/repositories/GuestbookRepository.js";
import type { GuestbookEntry } from "@cookids/domain/models/GuestbookEntry.js";
import type { GuestbookSettings } from "../config/GuestbookSchema.js";
import { formatGuestbookBody, parseGuestbookBody } from "./formatGuestbookBody.js";
import setIssueType from "./queries/setIssueType.gql.js";

@Injectable()
export class GitHubGuestbookRepository extends GuestbookRepository {
  private getConnection() {
    const token = constant<string>("envs.GITHUB_TOKEN");
    if (!token) throw new ServiceUnavailable("Le livre d’or est temporairement indisponible.");
    const settings = constant<GuestbookSettings>("guestbook");
    if (!settings) throw new ServiceUnavailable("Configuration du livre d’or indisponible.");
    return { client: new Octokit({ auth: token }), settings };
  }

  /** Lit toutes les pages d'issues modérées, sans publier les autres contenus du dépôt privé. */
  async listPublished(): Promise<GuestbookEntry[]> {
    try {
      const { client, settings } = this.getConnection();
      const issues = await client.paginate(client.rest.issues.listForRepo, {
        owner: settings.owner, repo: settings.repository, labels: settings.publishedLabel,
        state: "all", sort: "created", direction: "desc", per_page: 100,
      });
      return issues.flatMap((issue) => {
        if (issue.pull_request || issue.type?.node_id !== settings.issueType || !issue.labels.some((label) =>
          typeof label === "string" ? label === settings.publishedLabel : label.name === settings.publishedLabel)) return [];
        const entry = parseGuestbookBody(issue.body ?? "");
        return entry ? [entry] : [];
      });
    } catch {
      throw new ServiceUnavailable("Les avis sont temporairement indisponibles. Réessayez plus tard.");
    }
  }

  /** Crée un avis privé non publié, puis attribue son type ; aucun label d'approbation n'est ajouté. */
  async save(entry: GuestbookEntry): Promise<void> {
    try {
      const { client, settings } = this.getConnection();
      const issue = await client.rest.issues.create({
        owner: settings.owner, repo: settings.repository,
        title: `Avis de ${entry.author}`, body: formatGuestbookBody(entry),
      });
      await client.graphql(setIssueType, { issueId: issue.data.node_id, issueTypeId: settings.issueType });
    } catch {
      throw new ServiceUnavailable("Votre avis n’a pas pu être enregistré. Réessayez plus tard.");
    }
  }
}
