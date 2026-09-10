import { constant, Injectable } from "@tsed/di";
import { Octokit } from "octokit";
import addProjectItem from "./queries/addProjectItem.gql.js";
import setProjectStatus from "./queries/setProjectStatus.gql.js";
import setIssueFields from "./queries/setIssueFields.gql.js";
import setIssueType from "./queries/setIssueType.gql.js";
import { OrderRepository } from "@cookids/domain/repositories/OrderRepository.js";
import type { Order } from "@cookids/domain/models/Order.js";

@Injectable()
export class GitHubOrderRepository extends OrderRepository {
  async save(order: Order): Promise<{ id: number }> {
    const token = constant<string>("envs.GITHUB_TOKEN");
    const owner = constant<string>("githubBoards.owner");
    const assignee = constant<string>("githubBoards.assignee");
    const repository = constant<string>("githubBoards.repository");
    const projectId = constant<string>("githubBoards.projectId");
    const statusFieldId = constant<string>("githubBoards.fields.status");
    const pendingOptionId = constant<string>("githubBoards.statuses.pending");
    const issueTypeId = constant<string>("githubBoards.issueType");

    if (!token || !owner || !assignee || !repository || !projectId || !statusFieldId || !pendingOptionId || !issueTypeId) {
      throw new Error("GitHub commands configuration is incomplete.");
    }

    const client = new Octokit({
      auth: token,
      request: {
        headers: {
          "X-GitHub-Api-Version": "2026-03-10"
        }
      }
    });
    const issue = await client.rest.issues.create({
      owner,
      repo: repository,
      title: `Commande - ${order.customer.firstName}${order.customer.lastName ? ` ${order.customer.lastName}` : ""} - ${new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR"
      }).format(order.total)}`,
      assignees: [assignee],
      body: this.formatBody(order)
    });
    await client.graphql(setIssueType, { issueId: issue.data.node_id, issueTypeId });
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
    const item = await client.graphql<{
      addProjectV2ItemById: { item: { id: string } }
    }>(addProjectItem, { projectId, contentId: issue.data.node_id });
    await client.graphql(setProjectStatus, {
      projectId,
      itemId: item.addProjectV2ItemById.item.id,
      fieldId: statusFieldId,
      optionId: pendingOptionId
    });
    return { id: issue.data.number };
  }

  private formatBody(order: Order): string {
    const rows = order.items.map((item) => `| ${item.productName} | ${item.quantity} | ${item.unitPrice.toFixed(2)} € | ${item.total.toFixed(2)} € |`).join("\n");
    return `## Commande\n\n| Produit | Quantité | Prix unitaire | Sous-total |\n| --- | ---: | ---: | ---: |\n${rows}\n\n**Total : ${order.total.toFixed(2)} €**`;
  }
}
