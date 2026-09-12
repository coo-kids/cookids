import type { GuestbookEntry } from "@cookids/domain/models/GuestbookEntry.js";

function escape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/([\\`*_{}\[\]()#+.!|~-])/g, "\\$1").replace(/@/g, "&#64;");
}

/** Échappe le Markdown, les mentions et le HTML avant de signer l'avis dans l'issue. */
export function formatGuestbookBody(entry: GuestbookEntry): string {
  return `${escape(entry.comment)}\n\n— **${escape(entry.author)}**`;
}

/** Lit uniquement notre format signé ; les données restent du texte, jamais du HTML rendu. */
export function parseGuestbookBody(body: string): GuestbookEntry | null {
  const match = body.match(/^([\s\S]*)\n\n— \*\*([^\n]*)\*\*$/);
  if (!match) return null;
  const decode = (value: string) => value.replace(/\\([\\`*_{}\[\]()#+.!|~-])/g, "$1")
    .replace(/&#64;/g, "@").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
  const comment = decode(match[1]);
  const author = decode(match[2]);
  if (!author.trim() || author.length > 80 || !comment.trim() || comment.length > 2000) return null;
  return { author, comment };
}
