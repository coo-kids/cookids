import { injector } from "@tsed/di";
import { loadEnvironment } from "./loadEnvironment.js";
import { CatalogProvider, MailService, OrderRepository } from "@cookids/domain";
import { BunCatalogProvider } from "../content/BunCatalogProvider.js";
import { FakeOrderRepository } from "../repositories/FakeOrderRepository.js";
import { FakeMailService } from "../services/FakeMailService.js";

injector().settings.set({
  envs: loadEnvironment(),
  lazyProviders: true,
  imports: [
    {
      token: CatalogProvider,
      useClass: BunCatalogProvider
    },
    {
      token: OrderRepository,
      useClass: FakeOrderRepository
    },
    {
      token: MailService,
      useClass: FakeMailService
    }
  ]
})
