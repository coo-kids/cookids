import { inject } from "@tsed/di";
import { GuestbookService } from "@cookids/domain/services/GuestbookService.js";
import { defineFetchHandler } from "@cookids/infrastructure/http/defineFetchHandler.js";

export default defineFetchHandler({ method: "GET", path: "/api/guestbook", async handler() {
  const entries = await inject(GuestbookService).listPublished();
  return Response.json({ entries }, { headers: { "Cache-Control": "no-store" } });
} });
