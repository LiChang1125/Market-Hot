import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import assert from "node:assert/strict";

const dir = process.argv[2];
const $ = load(await readFile(dir + "/index.html", "utf8"));
const {cards, sources} = JSON.parse(await readFile(dir + "/digest.json", "utf8"));
const links = $("article h2 a, article h3 a");
assert.equal(links.length, cards.length);
assert.ok(cards.length >= 3 && sources.some((s: { ok: boolean }) => s.ok));
for (const card of cards) {
  assert.ok(card.title && card.source && card.summary && Date.parse(card.publishedAt) <= Date.now());
  assert.ok(["https:", "http:"].includes(new URL(card.url).protocol));
  assert.ok(links.toArray().some(el => $(el).attr("href") === card.url && $(el).text() === (card.reviewed ? card.titleZh : card.title)));
}
console.log("Verified", cards.length, "article links, titles and dates.");
