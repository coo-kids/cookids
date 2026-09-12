import { s } from "@tsed/schema";

export const GuestbookSchema = s.object({
  owner: s.string().required(),
  repository: s.string().required(),
  issueType: s.string().required(),
  publishedLabel: s.string().required(),
});
export type GuestbookSettings = s.infer<typeof GuestbookSchema>;
