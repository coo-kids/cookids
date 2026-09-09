import { injector } from "@tsed/di";
import { loadEnvironment } from "./loadEnvironment.js";
import { NodeSiteContentProvider } from "../content/NodeSiteContentProvider.js";
import { NodeCatalogProvider } from "../content/NodeCatalogProvider.js";
import { GitHubOrderRepository } from "../repositories/GitHubOrderRepository.js";
import { FakeOrderRepository } from "../repositories/FakeOrderRepository.js";
import { FakeMailService } from "../services/FakeMailService.js";
import { ResendMailService } from "../services/ResendMailService.js";
import { CatalogProvider } from "@cookids/domain/catalog/CatalogProvider.js";
import { SiteContentProvider } from "@cookids/domain/content/SiteContentProvider.js";
import { OrderRepository } from "@cookids/domain/repositories/OrderRepository.js";
import { MailService } from "@cookids/domain/mail/MailService.js";

injector().settings.set({
  envs: loadEnvironment(),
  lazyProviders: true,
  imports: [
    {
      token: CatalogProvider,
      useClass: NodeCatalogProvider
    },
    {
      token: SiteContentProvider,
      useClass: NodeSiteContentProvider
    },
    {
      token: OrderRepository,
      useClass: process.env.NODE_ENV === "test" ? FakeOrderRepository : GitHubOrderRepository
    },
    {
      token: MailService,
      useClass: process.env.NODE_ENV === "test" ? FakeMailService : ResendMailService
    }
  ]
})
