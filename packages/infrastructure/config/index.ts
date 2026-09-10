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
  envs: {
    "GITHUB_COMMANDS_REPOSITORY": "cookids-commands",
    "GITHUB_COMMANDS_PROJECT_ID": "PVT_kwDOE3stbc4Bi-3o",
    "GITHUB_FIELD_FIRST_NAME_ID": "IFT_kgDOAsk6pA",
    "GITHUB_FIELD_LAST_NAME_ID": "IFT_kgDOAsk62Q",
    "GITHUB_FIELD_EMAIL_ID": "IFT_kgDOAsk6Qg",
    "GITHUB_FIELD_PHONE_NUMBER_ID": "IFT_kgDOAsk6Uw",
    "GITHUB_FIELD_DELIVERY_LOCATION_ID": "IFSS_kgDOAsk7Tg",
    "GITHUB_FIELD_TARGET_DATE_ID": "IFD_kgDOAsjrDQ",
    "GITHUB_FIELD_TOTAL_PRICE_ID": "IFN_kgDOAslCYA",
    "GITHUB_STATUS_FIELD_ID": "PVTSSF_lADOE3stbc4Bi-3ozhh06gU",
    "GITHUB_STATUS_PENDING_OPTION_ID": "6efdbf1e",
    "GITHUB_COMMANDS_ISSUE_TYPE_ID": "IT_kwDOE3stbc4ziBbG",
    "GITHUB_LOCATION_ROSA_PARKS_OPTION_ID": "IFSSO_kgDOBOB43A",
    "GITHUB_LOCATION_SAINT_LAZARE_OPTION_ID": "IFSSO_kgDOBOB43Q",
    "GITHUB_LOCATION_LE_PERREUX_SUR_MARNE_OPTION_ID": "IFSSO_kgDOBOB43g",
    "GITHUB_LOCATION_NEUILLY_PLAISANCE_OPTION_ID": "IFSSO_kgDOBOB43w",
    "GITHUB_LOCATION_MONTREUIL_OPTION_ID": "IFSSO_kgDOBOB44A",
    ...loadEnvironment()
  },
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
});
