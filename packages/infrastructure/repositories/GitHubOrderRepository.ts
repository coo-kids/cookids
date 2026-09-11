import { constant, context, Injectable } from "@tsed/di";
import { Octokit } from "octokit";
import addProjectItem from "./queries/addProjectItem.gql.js";
import setProjectStatus from "./queries/setProjectStatus.gql.js";
import setIssueFields from "./queries/setIssueFields.gql.js";
import setIssueType from "./queries/setIssueType.gql.js";
import { OrderRepository } from "@cookids/domain/repositories/OrderRepository.js";
import type { Order } from "@cookids/domain/models/Order.js";

type Issue = Awaited<ReturnType<Octokit["rest"]["issues"]["create"]>>;

@Injectable()
export class GitHubOrderRepository extends OrderRepository {
  /** Crée l'issue GitHub, renseigne ses métadonnées de projet et retourne son numéro. */
  async save(order: Order): Promise<{ id: number }> {
    const {
      projectId,
      statusFieldId,
      pendingOptionId,
      issueTypeId
    } = this.getSettings();

    const issue = await this.createIssue(order);

    await this.setIssueType(issue, issueTypeId);
    await this.setCustomFieldValues(issue, order);
    await this.addIssueToProject(projectId, issue, statusFieldId, pendingOptionId);

    return { id: issue.data.number };
  }

  /** Ajoute l'issue au projet GitHub puis initialise son statut. */
  protected async addIssueToProject(projectId: string, issue: Issue, statusFieldId: string, pendingOptionId: string) {
    const client = this.getClient();

    const item = await client.graphql<{
      addProjectV2ItemById: { item: { id: string } }
    }>(addProjectItem, { projectId, contentId: issue.data.node_id });

    await client.graphql(setProjectStatus, {
      projectId,
      itemId: item.addProjectV2ItemById.item.id,
      fieldId: statusFieldId,
      optionId: pendingOptionId
    });
  }

  /** Copie les informations métier de la commande dans les champs du projet GitHub. */
  protected async setCustomFieldValues(issue: Issue, order: Order) {
    const client = this.getClient();

    await client.graphql(setIssueFields, {
      issueId: issue.data.node_id,
      issueFields: [
        {
          fieldId: constant<string>("githubBoards.fields.firstName"),
          textValue: order.customer.firstName
        },
        ...(order.customer.lastName ? [{
          fieldId: constant<string>("githubBoards.fields.lastName"),
          textValue: order.customer.lastName
        }] : []),
        {
          fieldId: constant<string>("githubBoards.fields.email"),
          textValue: order.customer.email
        },
        ...(order.customer.phoneNumber ? [{
          fieldId: constant<string>("githubBoards.fields.phoneNumber"),
          textValue: order.customer.phoneNumber
        }] : []),
        {
          fieldId: constant<string>("githubBoards.fields.location"),
          singleSelectOptionId: order.deliveryLocation
        },
        { fieldId: constant<string>("githubBoards.fields.totalPrice"), numberValue: order.total },
        ...(order.targetDeliveryDate ? [{
          fieldId: constant<string>("githubBoards.fields.targetDate"),
          dateValue: order.targetDeliveryDate.toISOString().slice(0, 10)
        }] : [])
      ]
    });
  }

  /** Attribue à l'issue le type configuré pour les commandes. */
  protected async setIssueType(issue: Issue, issueTypeId: string) {
    const client = this.getClient();

    await client.graphql(setIssueType, { issueId: issue.data.node_id, issueTypeId });
  }

  /** Crée l'issue GitHub initiale qui porte le détail de la commande. */
  protected async createIssue(order: Order): Promise<Issue> {
    const client = this.getClient();
    const {
      owner,
      assignee,
      repository
    } = this.getSettings();

    return client.rest.issues.create({
      owner,
      repo: repository,
      title: `Commande - ${order.customer.firstName}${order.customer.lastName ? ` ${order.customer.lastName}` : ""} - ${new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR"
      }).format(order.total)}`,
      assignees: [assignee],
      body: this.formatBody(order)
    });
  }

  /** Construit un client GitHub authentifié et figé sur la version d'API choisie. */
  protected getClient() {
    const token = constant<string>("envs.GITHUB_TOKEN");

    return new Octokit({
      auth: token,
      request: {
        headers: {
          "X-GitHub-Api-Version": "2026-03-10"
        }
      }
    });
  }

  /** Charge et vérifie les paramètres GitHub indispensables à la création d'une commande. */
  protected getSettings() {
    const token = constant<string>("envs.GITHUB_TOKEN");
    const owner = constant<string>("githubBoards.owner");
    const assignee = constant<string>("githubBoards.assignee");
    const repository = constant<string>("githubBoards.repository");
    const projectId = constant<string>("githubBoards.projectId");
    const statusFieldId = constant<string>("githubBoards.fields.status");
    const pendingOptionId = constant<string>("githubBoards.statuses.pending");
    const issueTypeId = constant<string>("githubBoards.issueType");

    if (!token || !owner || !assignee || !repository || !projectId || !statusFieldId || !pendingOptionId || !issueTypeId) {
      context().logger.error({
        event: "github.configuration.missing",
        github_token_configured: Boolean(token),
        github_owner_configured: Boolean(owner),
        github_assignee_configured: Boolean(assignee),
        github_repository_configured: Boolean(repository),
        github_project_id_configured: Boolean(projectId),
        github_status_field_id_configured: Boolean(statusFieldId),
        github_pending_option_id_configured: Boolean(pendingOptionId),
        github_issue_type_id_configured: Boolean(issueTypeId)
      });
      throw new Error("GitHub commands configuration is incomplete.");
    }
    return {
      token,
      owner,
      assignee,
      repository,
      projectId,
      statusFieldId,
      pendingOptionId,
      issueTypeId
    };
  }

  /** Met en forme le détail de la commande pour le corps Markdown de l'issue. */
  protected formatBody(order: Order): string {
    const rows = order.items.map((item) => `| ${item.productName} | ${item.quantity} | ${item.unitLabel} | ${item.unitPrice.toFixed(2)} € | ${item.total.toFixed(2)} € |`).join("\n");
    return `## Commande\n\n| Produit | Quantité | Unité | Prix unitaire | Sous-total |\n| --- | ---: | --- | ---: | ---: |\n${rows}\n\n**Total : ${order.total.toFixed(2)} €**`;
  }
}
