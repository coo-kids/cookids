import { injector } from "@tsed/di";
import { loadEnvironment } from "./loadEnvironment.js";
import { CatalogProvider, MailService, OrderRepository, SiteContentProvider } from "@cookids/domain";
import { BunSiteContentProvider } from "../content/BunSiteContentProvider.js";
import { BunCatalogProvider } from "../content/BunCatalogProvider.js";
import { GitHubOrderRepository } from "../repositories/GitHubOrderRepository.js";
import { FakeOrderRepository } from "../repositories/FakeOrderRepository.js";
import { FakeMailService } from "../services/FakeMailService.js";
import { ResendMailService } from "../services/ResendMailService.js";

injector().settings.set({
  envs: loadEnvironment(),
  lazyProviders: true,
  imports: [
    {
      token: CatalogProvider,
      useClass: BunCatalogProvider
    },
    {
      token: SiteContentProvider,
      useClass: BunSiteContentProvider
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
