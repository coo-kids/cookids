import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validate } from "@tsed/ajv";
import { parse } from "yaml";
import { type GitHubBoards, GitHubBoardsSchema } from "./GitHubBoardsSchema.js";

const boardsPath = resolve(process.cwd(), "contents/boards.yml");

export async function loadGitHubBoards(): Promise<GitHubBoards> {
  return validate<GitHubBoards>(parse(await readFile(boardsPath, "utf8")), {
    type: GitHubBoardsSchema
  });
}
