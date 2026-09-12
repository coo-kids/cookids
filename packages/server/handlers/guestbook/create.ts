import { inject } from "@tsed/di";
import { validate } from "@tsed/ajv";
import { deserialize } from "@tsed/json-mapper";
import { BadRequest, TooManyRequests } from "@tsed/exceptions";
import { GuestbookEntry } from "@cookids/domain/models/GuestbookEntry.js";
import { GuestbookService } from "@cookids/domain/services/GuestbookService.js";
import { defineFetchHandler } from "@cookids/infrastructure/http/defineFetchHandler.js";

// Protection complémentaire par instance ; pas un limiteur distribué en environnement serverless.
let nextSubmissionAt = 0;
export default defineFetchHandler({ method: "POST", path: "/api/guestbook", async handler(request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new BadRequest("Un corps JSON est requis.");
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new BadRequest("Origine non autorisée.");
  const reader = request.body?.getReader();
  if (!reader) throw new BadRequest("Le corps JSON est requis.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 16_000) { await reader.cancel(); throw new BadRequest("Votre avis est trop long."); }
    chunks.push(value);
  }
  let payload;
  try { payload = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new BadRequest("Le corps JSON est invalide."); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
    Object.keys(payload).some((key) => !["author", "comment", "website"].includes(key))) throw new BadRequest("Champs non autorisés.");
  if (payload.website) throw new BadRequest("Votre avis n’a pas pu être envoyé.");
  if (typeof payload.author !== "string" || typeof payload.comment !== "string") throw new BadRequest("Le prénom et le commentaire sont requis.");
  const values = { author: payload.author.trim(), comment: payload.comment.trim() };
  if (!values.author || !values.comment || /[\r\n\u0000-\u001f\u007f]/.test(values.author) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(values.comment)) throw new BadRequest("Votre avis contient des caractères invalides.");
  await validate(values, { type: GuestbookEntry });
  const entry = deserialize<GuestbookEntry>(values, { type: GuestbookEntry, useAlias: false });
  if (Date.now() < nextSubmissionAt) throw new TooManyRequests("Merci de patienter une minute avant un nouvel avis.");
  nextSubmissionAt = Date.now() + 60_000;
  await inject(GuestbookService).save(entry);
  return Response.json({ accepted: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
} });
