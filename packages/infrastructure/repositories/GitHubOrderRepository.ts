import { constant, Injectable } from "@tsed/di";
import { Octokit } from "octokit";
import { type Order, OrderRepository } from "@cookids/domain";
import addProjectItem from "./queries/addProjectItem.graphql?raw";
import setProjectStatus from "./queries/setProjectStatus.graphql?raw";
import setIssueFields from "./queries/setIssueFields.graphql?raw";

@Injectable()
export class GitHubOrderRepository extends OrderRepository {
  async save(order: Order): Promise<void> {
    const token = constant<string>("envs.GITHUB_TOKEN");
    const owner = constant<string>("envs.GITHUB_COMMANDS_OWNER");
    const assignee = constant<string>("envs.GITHUB_COMMANDS_ASSIGNEE");
    const repository = constant<string>("envs.GITHUB_COMMANDS_REPOSITORY");
    const projectId = constant<string>("envs.GITHUB_COMMANDS_PROJECT_ID");
    const statusFieldId = constant<string>("envs.GITHUB_STATUS_FIELD_ID");
    const pendingOptionId = constant<string>("envs.GITHUB_STATUS_PENDING_OPTION_ID");

    if (!token || !owner || !assignee || !repository || !projectId || !statusFieldId || !pendingOptionId) {
      throw new Error("GitHub commands configuration is incomplete.");
    }

    const client = new Octokit({ auth: token });
    const issue = await client.rest.issues.create({
      owner,
      repo: repository,
      title: `Commande - ${order.customer.firstName}${order.customer.lastName ? ` ${order.customer.lastName}` : ""} - ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(order.totalPrice)}`,
      assignees: [assignee],
      body: this.formatBody(order)
    });
    await client.graphql(setIssueFields, {
      issueId: issue.data.node_id,
      issueFields: [
        { fieldId: constant<string>("envs.GITHUB_FIELD_FIRST_NAME_ID"), textValue: order.customer.firstName },
        ...(order.customer.lastName ? [{ fieldId: constant<string>("envs.GITHUB_FIELD_LAST_NAME_ID"), textValue: order.customer.lastName }] : []),
        { fieldId: constant<string>("envs.GITHUB_FIELD_EMAIL_ID"), textValue: order.customer.email },
        ...(order.customer.phoneNumber ? [{ fieldId: constant<string>("envs.GITHUB_FIELD_PHONE_NUMBER_ID"), textValue: order.customer.phoneNumber }] : []),
        { fieldId: constant<string>("envs.GITHUB_FIELD_TOTAL_PRICE_ID"), numberValue: order.totalPrice },
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
  }

  private formatBody(order: Order): string {
    const rows = order.items.map((item) => `| ${item.productName} | ${item.quantity} | ${(item.unitPriceCents / 100).toFixed(2)} € | ${(item.totalCents / 100).toFixed(2)} € |`).join("\n");
    return `## Commande ${order.id}\n\n| Produit | Quantité | Prix unitaire | Sous-total |\n| --- | ---: | ---: | ---: |\n${rows}\n\n**Total : ${order.totalPrice.toFixed(2)} €**`;
  }
}
