import { s } from "@tsed/schema";

export const StatisticsSchema = s.object({
  totalCookiesSold: s.integer().minimum(0).required(),
});

export type Statistics = s.infer<typeof StatisticsSchema>;
