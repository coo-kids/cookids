import { defineFetchHandler } from "@cookids/infrastructure/http/defineFetchHandler.js";

export default defineFetchHandler({
  path: "/health",
  method: "GET",
  handler() {
    return Response.json({ status: "OK" });
  }
});