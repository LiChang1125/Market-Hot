import { load } from "cheerio";
import type { ServerModule } from "@aihot/backend/modules";
import { sql } from "@aihot/backend/db";
import { beijingDate } from "@aihot/contracts/time";
import { products, sourceUrl, type Observation, type Tool } from "@aihot/site/marketing-tools";

const clean = (value: string) => value.replace(/\s+/g, " ").trim();

export function parseListing(html: string): Observation {
  const $ = load(html);
  let score: { ratingValue: number; ratingCount: number } | undefined;
  for (const script of $('script[type="application/ld+json"]').toArray()) {
    try {
      const data = JSON.parse($(script).text());
      if (data["@type"] === "SoftwareApplication" && data.aggregateRating) score = data.aggregateRating;
    } catch { /* Other structured data can be unrelated to the app. */ }
  }
  const title = clean($("h1").first().text());
  const rating = Number(score?.ratingValue);
  const reviews = Number(score?.ratingCount);
  if (!title || !Number.isFinite(rating) || rating < 1 || rating > 5 || !Number.isInteger(reviews) || reviews < 1) {
    throw new Error("App listing has no verifiable title and review data");
  }
  const plans = $(".app-details-pricing-plan-card").toArray().map(card => ({
    name: clean($(card).find('[data-test-id="name"]').first().text()),
    price: clean($(card).find("h3").first().attr("aria-label") || ""),
    features: [...new Set($(card).find("li").toArray().map(el => clean($(el).text())).filter(Boolean))].slice(0, 3),
  })).filter(plan => plan.price);
  return { title, rating, reviews, plans };
}

export async function refreshTools() {
  if (process.env.COLLECT_ENABLED !== "true") return { checked: 0 };
  let checked = 0;
  for (const tool of products) {
    try {
      const res = await fetch(sourceUrl(tool.slug) + "?locale=en", { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const latest = parseListing(await res.text());
      const now = new Date();
      await sql`INSERT INTO market_tool_observations (slug, day, checked_at, observation)
        VALUES (${tool.slug}, ${beijingDate(now)}, ${now}, ${sql.json(JSON.parse(JSON.stringify(latest)))})
        ON CONFLICT (slug, day) DO UPDATE SET checked_at=EXCLUDED.checked_at, observation=EXCLUDED.observation
        WHERE market_tool_observations.checked_at < EXCLUDED.checked_at`;
      checked++;
    } catch (err) { console.warn("Marketing tool collection", tool.slug, String(err)); }
  }
  if (!checked) throw new Error("No marketing tool listings could be verified");
  return { checked };
}

export async function currentTools(): Promise<Tool[]> {
  const rows = await sql<{slug:string; checked_at:Date; observation:Observation}[]>`
    SELECT DISTINCT ON (slug) slug, checked_at, observation FROM market_tool_observations ORDER BY slug, checked_at DESC`;
  return rows.flatMap(row => {
    const tool = products.find(p => p.slug === row.slug);
    return tool ? [{ ...tool, ...row.observation, checked: row.checked_at.toISOString() }] : [];
  }).sort((a,b) => b.rating - a.rating || b.reviews - a.reviews || a.slug.localeCompare(b.slug));
}

const module: ServerModule = {
  name: "tool-rank",
  http(app) {
    app.get("/api/site/marketing-tools", async () => currentTools());
    app.get<{Params:{slug:string}}>("/api/site/marketing-tools/:slug", async (req, reply) => {
      const tool = (await currentTools()).find(t => t.slug === req.params.slug);
      if (!tool) return reply.code(404).send({ error: "unknown_tool" });
      const history = await sql<{day:string;rating:number;reviews:number}[]>`
        SELECT day::text, (observation->>'rating')::float8 AS rating, (observation->>'reviews')::int AS reviews
        FROM market_tool_observations WHERE slug=${tool.slug} ORDER BY day DESC LIMIT 90`;
      return { tool, history };
    });
  },
  schedules: [{ name: "market-tool-check", cron: "15 */6 * * *", run: refreshTools, when: () => process.env.COLLECT_ENABLED === "true" }],
};
export default module;
