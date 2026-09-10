import { defineFetchHandler } from "@cookids/infrastructure";
import ordersHandler from "../orders/handler.js";

export default defineFetchHandler({
  path: "/health",
  method: "GET",
  handler(){
    return Response.json({ status: "OK" })
  }
})