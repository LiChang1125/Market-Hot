import { mkdir, writeFile } from "node:fs/promises";
import { closeDb, sql } from "@aihot/backend/db";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { collectSource, type CollectResult } from "@aihot/backend/sources/collect";
import { publishArticle } from "@aihot/backend/publication/publish";
import { v1Items } from "@aihot/backend/publication/v1";
import { publicSourceName } from "@aihot/backend/publication/rules";
import { readingBeat } from "../../industry/free-reader.ts";

const destination = ".data/free-reader";
const day = 86_400_000;
const now = new Date();
if (new URL(process.env.DATABASE_URL!).pathname !== "/markethot_free") {
  throw new Error("Use the dedicated markethot_free build database.");
}
const clean = (text: string) => text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

try {
  const enabled = await sql<{ id: string; name: string; tier: string }[]>`
    SELECT id, name, tier FROM sources WHERE enabled AND participation_mode='editorial'
      AND kind IN ('rss','web_list','json_list') AND coalesce(config->>'url','') NOT LIKE 'https://r.jina.ai/%' ORDER BY id`;
  const pending = [...enabled];
  const results = new Map<string, CollectResult>();
  await Promise.all(Array.from({ length: 5 }, async () => {
    for (let source; (source = pending.shift());) {
      const run = await collectSource(source.id);
      results.set(source.id, run);
      console.log(source.id, run.status, run.found, run.created, run.error ?? "");
    }
  }));

  const articles = await sql<{id: string; source_id: string; title: string; excerpt: string | null; sample: string | null}[]>`
    SELECT a.id, source_id, title, excerpt, left(body_text, 600) AS sample
    FROM articles a JOIN sources s ON s.id = a.source_id
    WHERE s.enabled AND s.participation_mode = 'editorial' AND published_at BETWEEN now()-interval '7 days' AND now()
    ORDER BY published_at DESC`;
  for (const article of articles) {
    const title = clean(article.title);
    const excerpt = clean(article.excerpt || article.sample || "");
    const category = readingBeat(title, excerpt.slice(0, 450), article.source_id);
    if (!category || !excerpt || title.length < 6 || title.length > 240) continue;
    const boundary = excerpt.match(/^.{35,180}?[。！？]|^.{45,200}?[.!?](?=\s|$)/u);
    const summary = boundary?.[0]?.trim() || (excerpt.length <= 150 ? excerpt : excerpt.slice(0, 145).trimEnd() + "…");
    if (summary === title) continue;
    // An original-language reading card, with no invented model score or selected seat.
    const fields = { title, summary, category, relevance: "pass", selected: false };
    await sql`INSERT INTO editorial_overrides (article_id, fields, reason, updated_by)
      VALUES (${article.id}, ${sql.json(fields)}, 'Free edition source excerpt', 'market-hot-pages')
      ON CONFLICT (article_id) DO UPDATE SET fields = EXCLUDED.fields
      WHERE editorial_overrides.updated_by = 'market-hot-pages'`;
    await publishArticle(article.id);
  }

  // Use the same public read contract as RSS and the public API.
  const page = await v1Items({ mode: "all", by: "published", window: "7d", category: null, q: null, cursor: null, limit: 500 }, now);
  const owners = new Map(enabled.map(s => [publicSourceName(s.name), s]));
  const seenTitles = new Set<string>();
  const seenUrls = new Set<string>();
  const cards = page.items.flatMap(item => {
    const source = owners.get(item.source.name);
    if (!source || !item.publishedAt || !/^https?:\/\//i.test(item.links.original) || !item.summary || !item.category) return [];
    return [{ title: item.title, summary: item.summary, url: item.links.original, source: item.source.name,
      sourceId: source.id, official: source.tier === "T1", category: item.category, publishedAt: item.publishedAt }];
  }).sort((a,b) => Number(b.official) - Number(a.official) || a.publishedAt.localeCompare(b.publishedAt)).filter(card => {
    const key = card.title.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu,"");
    if (seenTitles.has(key) || seenUrls.has(card.url)) return false;
    seenTitles.add(key); seenUrls.add(card.url); return true;
  }).sort((a,b) => b.publishedAt.localeCompare(a.publishedAt));
  const sources = enabled.map(s => ({ name: publicSourceName(s.name), id: s.id, ok: results.get(s.id)?.status === "ok",
    found: results.get(s.id)?.found ?? 0, published: cards.filter(c => c.sourceId === s.id).length }));
  if (cards.length < 3 || new Set(cards.map(c => c.sourceId)).size < 2 || !cards.some(c => Date.parse(c.publishedAt) > +now - 3 * day)) {
    throw new Error("Too few recent, independently sourced articles. Keeping the previous deployment.");
  }
  await mkdir(destination, {recursive:true});
  await writeFile(destination + "/digest.json", JSON.stringify({ updatedAt: new Date().toISOString(), sources, cards }, null, 2));
  console.log("Published candidates:", cards.length, "from", sources.filter(s => s.published).length, "sources");
} finally {
  await stopBoss();
  await closeDb();
}
