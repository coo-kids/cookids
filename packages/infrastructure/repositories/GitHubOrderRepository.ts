import { constant, Injectable } from "@tsed/di";
import { Octokit } from "octokit";
import addProjectItem from "./queries/addProjectItem.gql.js";
import setProjectStatus from "./queries/setProjectStatus.gql.js";
import setIssueFields from "./queries/setIssueFields.gql.js";
import setIssueType from "./queries/setIssueType.gql.js";
import { getDeliveryLocationOptionId } from "./getDeliveryLocationOptionId.js";
import { OrderRepository } from "@cookids/domain/repositories/OrderRepository.js";
import type { Order } from "@cookids/domain/models/Order.js";

@Injectable()
export class GitHubOrderRepository extends OrderRepository {
  async save(order: Order): Promise<{ id: number }> {
    const token = constant<string>("envs.GITHUB_TOKEN");
    const owner = constant<string>("envs.GITHUB_COMMANDS_OWNER");
    const assignee = constant<string>("envs.GITHUB_COMMANDS_ASSIGNEE");
    const repository = constant<string>("envs.GITHUB_COMMANDS_REPOSITORY");
    const projectId = constant<string>("envs.GITHUB_COMMANDS_PROJECT_ID");
    const statusFieldId = constant<string>("envs.GITHUB_STATUS_FIELD_ID");
    const pendingOptionId = constant<string>("envs.GITHUB_STATUS_PENDING_OPTION_ID");
    const issueTypeId = constant<string>("envs.GITHUB_COMMANDS_ISSUE_TYPE_ID");

    if (!token || !owner || !assignee || !repository || !projectId || !statusFieldId || !pendingOptionId || !issueTypeId) {
      throw new Error("GitHub commands configuration is incomplete.");
    }

    const client = new Octokit({ auth: token });
    const issue = await client.rest.issues.create({
      owner,
      repo: repository,
      title: `Commande - ${order.customer.firstName}${order.customer.lastName ? ` ${order.customer.lastName}` : ""} - ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(order.total)}`,
      assignees: [assignee],
      body: this.formatBody(order)
    });
    await client.graphql(setIssueType, { issueId: issue.data.node_id, issueTypeId });
    await client.graphql(setIssueFields, {
      issueId: issue.data.node_id,
      issueFields: [
        { fieldId: constant<string>("envs.GITHUB_FIELD_FIRST_NAME_ID"), textValue: order.customer.firstName },
        ...(order.customer.lastName ? [{ fieldId: constant<string>("envs.GITHUB_FIELD_LAST_NAME_ID"), textValue: order.customer.lastName }] : []),
        { fieldId: constant<string>("envs.GITHUB_FIELD_EMAIL_ID"), textValue: order.customer.email },
        ...(order.customer.phoneNumber ? [{ fieldId: constant<string>("envs.GITHUB_FIELD_PHONE_NUMBER_ID"), textValue: order.customer.phoneNumber }] : []),
        { fieldId: constant<string>("envs.GITHUB_FIELD_DELIVERY_LOCATION_ID"), singleSelectOptionId: getDeliveryLocationOptionId(order.deliveryLocation) },
        { fieldId: constant<string>("envs.GITHUB_FIELD_TOTAL_PRICE_ID"), numberValue: order.total },
        ...(order.targetDeliveryDate ? [{ fieldId: constant<string>("envs.GITHUB_FIELD_TARGET_DATE_ID"), dateValue: order.targetDeliveryDate.toISOString().slice(0, 10) }] : [])
      ]
    });
    const item = await client.graphql<{ addProjectV2ItemById: { item: { id: string } } }>(addProjectItem, { projectId, contentId: issue.data.node_id });
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
