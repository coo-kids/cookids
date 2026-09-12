import list from "../packages/server/handlers/guestbook/list.js";
import create from "../packages/server/handlers/guestbook/create.js";

export default { fetch(request: Request) {
  return request.method === "GET" ? list(request) : create(request);
} };
