import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "yaml";
import { validate } from "@tsed/ajv";
import { CatalogProvider } from "@cookids/domain/catalog/CatalogProvider.js";
import {
  type ContentCatalog,
  ContentCatalogSchema
} from "@cookids/domain/schemas/ContentCatalogSchema.js";
import { assertCatalogCategories } from "@cookids/domain/schemas/assertCatalogCategories.js";

const catalogPath = resolve(process.cwd(), "contents/catalog.yml");

export class NodeCatalogProvider extends CatalogProvider {
  private catalogPromise: Promise<ContentCatalog> | undefined;

  getCatalog(): Promise<ContentCatalog> {
    this.catalogPromise ??= this.loadCatalog();
    return this.catalogPromise;
  }

  private async loadCatalog(): Promise<ContentCatalog> {
    const contentCatalog = parse(await readFile(catalogPath, "utf8"));
    const validatedCatalog = await validate<ContentCatalog>(contentCatalog, {
      type: ContentCatalogSchema
    });

    return assertCatalogCategories(validatedCatalog);
  }
}
