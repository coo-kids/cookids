import { readFile, writeFile } from "node:fs/promises";
import { Octokit } from "octokit";
import { parse, stringify } from "yaml";
import { validate } from "@tsed/ajv";
import { loadGitHubBoards } from "../config/loadGitHubBoards.js";
import { countSoldCookies } from "./countSoldCookies.js";
import { StatisticsSchema, type Statistics } from "@cookids/domain/schemas/StatisticsSchema.js";

const token = process.env.COOKIDS_STATS_TOKEN;
if (!token) throw new Error("Configurer le secret COOKIDS_STATS_TOKEN avant de lancer le comptage.");
const boards = await loadGitHubBoards();
const totalCookiesSold = await countSoldCookies(new Octokit({ auth: token }), boards);
const next = await validate<Statistics>({ totalCookiesSold }, { type: StatisticsSchema });
const path = "contents/statistics.yml";
const current = parse(await readFile(path, "utf8"));
if (current.totalCookiesSold !== next.totalCookiesSold) {
  await writeFile(path, stringify(next), "utf8");
}
console.log(`Comptage terminé : ${totalCookiesSold} cookies vendus.`);
