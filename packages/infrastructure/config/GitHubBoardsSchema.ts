import { s } from "@tsed/schema";

const GitHubBoardFieldSchema = s.object({
  firstName: s.string().required(),
  lastName: s.string().required(),
  email: s.string().required(),
  phoneNumber: s.string().required(),
  location: s.string().required(),
  targetDate: s.string().required(),
  totalPrice: s.string().required(),
  totalCookies: s.string().required(),
  status: s.string().required()
});

export const GitHubBoardsSchema = s.object({
  repository: s.string().required(),
  owner: s.string().required(),
  projectId: s.string().required(),
  assignee: s.string().required(),
  fields: GitHubBoardFieldSchema.required(),
  statuses: s.object({ pending: s.string().required(), completed: s.string().required() }).required(),
  issueType: s.string().required()
});

export type GitHubBoards = s.infer<typeof GitHubBoardsSchema>;
