import { createServer } from "./server.js";
import { $log } from "@tsed/logger";

const server = createServer({
  port: process.env.PORT || 3001
});

$log.info({
  event: "SERVER_READY",
  port: server.port,
  url: server.url
});