import { validate } from "@tsed/ajv";
import source from "../../../../contents/statistics.yml";
import { StatisticsSchema, type Statistics } from "@cookids/domain/schemas/StatisticsSchema.js";

export const statistics = await validate<Statistics>(source, { type: StatisticsSchema });
