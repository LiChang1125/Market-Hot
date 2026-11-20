// Rebuild the inaugural retrospective only from the archived public edition that preceded its cutoff.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { beijingAt } from "@aihot/contracts/time";
import { EDITION_TIMES } from "@aihot/site";
import { sql, closeDb } from "@aihot/backend/db";
import { saveReport } from "@aihot/backend/reports/compose";
import { sectionOf, SECTION_ORDER, type DailyEntry } from "@aihot/backend/reports/edition";

const archiveHash = "8b945dbaed02123b1de8b4a46a9363bd3d63a81fdf0acc26cd8e51ceb3981942";
const chosen = ["cma-provisionally-finds-that-viagogo-may-have-broken-the-law-on-hidden-fees",
  "advertisers-suspend-tiktok-activity-in-response-to-spanish-csam-investigation", "inside-nikes-plan-to-turn-creators-into-brand-builders"];
const date = "2026-11-20";
const end = beijingAt(date, EDITION_TIMES.daily);
const start = new Date(+end - 86400000);

try {
  const bytes = await readFile(process.argv[2]!);
  if (createHash("sha256").update(bytes).digest("hex") !== archiveHash) throw Error("Different archive file");
  const archive: { updatedAt: string; cards: { url: string; publishedAt: string; sourceId: string; title: string }[] } = JSON.parse(bytes.toString("utf8"));
  const captured = new Date(archive.updatedAt);
  if (!(start <= captured && captured < end)) throw Error("Archive outside issue window");
  const entries: { category: string; entry: DailyEntry }[] = [];
  for (const slug of chosen) {
    const card = archive.cards.find(c => new URL(c.url).pathname.split("/").filter(Boolean).at(-1) === slug);
    if (!card || !(start <= new Date(card.publishedAt) && new Date(card.publishedAt) <= captured)) throw Error("Missing archived report: " + slug);
    const [row] = await sql`SELECT p.article_id,p.url,p.title,p.summary,p.category,s.name,s.tier
      FROM publications p JOIN sources s ON p.source_id=s.id
      WHERE p.visibility='public' AND p.source_id=${card.sourceId} AND p.original_title=${card.title}`;
    if (!row || new URL(row.url).pathname.replace(/\/$/, "") !== new URL(card.url).pathname.replace(/\/$/, "")) throw Error("Missing native publication: " + slug);
    entries.push({category: row.category, entry: {itemId: row.article_id, factId: null, storyPublicId: null,
      sourceId: card.sourceId, sourceName: row.name, sourceUrl: row.url, title: row.title, summary: row.summary,
      firstParty: row.tier === "T1", role: row.tier === "T1" ? "官方" : "媒体", publishedAt: card.publishedAt, sources: 1, score: null}});
  }
  const [first, ...rest] = entries.map(e => e.entry);
  if (!first) throw Error("No verified archive entries");
  const content = {date, lead: { title: first.title, leadParagraph: "本期由编辑从此前已公开的 Market Hot 阅读版整理。"+first.summary },
    leadItemId: first.itemId, highlights: rest.map(e => e.itemId),
    sections: SECTION_ORDER.map(label => ({label, items: entries.filter(e => sectionOf(e.category) === label).map(e => e.entry)})).filter(s => s.items.length),
    flashes: [], metrics: {totalEvents: entries.length, sourcesCount: new Set(entries.map(e=>e.entry.sourceId)).size,
      firstPartyEvents: entries.filter(e=>e.entry.firstParty).length}, windowStart:start.toISOString(), windowEnd:end.toISOString(),
    generator:{version:"reader-archive", archivedAt:archive.updatedAt, artifactId:"14546475486",sha256:archiveHash}};
  console.log("Inaugural reader archive:", await saveReport("daily",date,start,end,content,undefined,[]) ? "published" : "already exists");
} finally { await closeDb(); }
