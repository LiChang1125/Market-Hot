import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { SITE } from "@aihot/site";
import { CATEGORIES } from "@aihot/industry/taxonomy";

type Card = { title: string; titleZh?: string; summary: string; summaryZh?: string; reviewed?: boolean; publishedAt: string; official: boolean; url: string; source: string; category: string };
type Source = { id: string; name: string; ok: boolean; found: number; published: number };
const input = ".data/free-reader/digest.json";
const { cards, sources, updatedAt }: { cards: Card[]; sources: Source[]; updatedAt: string } = JSON.parse(await readFile(input, "utf8"));
const reviewed: Record<string, [string, string]> = JSON.parse(await readFile("industry/reader-copy.json", "utf8"));
for (const card of cards) {
  if (Object.hasOwn(reviewed, card.title)) {
    [card.titleZh, card.summaryZh] = reviewed[card.title]!;
    card.reviewed = true;
  }
}
const out = ".data/pages-site";
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const date = (s: string, withTime = false) => new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "2-digit", day: "2-digit", ...(withTime ? {hour:"2-digit",minute:"2-digit",hour12:false} : {}) }).format(new Date(s));
const label = new Map<string,string>(CATEGORIES.map(c=>[c.key,c.label]));
const updated = esc(date(updatedAt,true));
const ok = sources.filter(s => s.ok).length;
const headline = (c: Card) => esc(c.reviewed ? c.titleZh! : c.title);
const summary = (c: Card) => esc(c.reviewed ? c.summaryZh! : c.summary);
function article(c: Card, lead = false) {
  const original = c.reviewed ? `<details class="original"><summary>查看原标题</summary><span lang="en">${esc(c.title)}</span></details>`
    : c.titleZh ? `<details class="original"><summary>查看机器翻译</summary><span>${esc(c.titleZh)}</span><p>${esc(c.summaryZh || "")}</p></details>` : "";
  const tag = lead ? "h2" : "h3";
  return `<article class="${lead ? "lead" : "story"}" data-beat="${esc(c.category)}">
    <div class="by"><span>${esc(label.get(c.category) || "行业动态")}</span><span>${esc(c.source)}${c.official ? " · 一手" : ""}</span><time datetime="${esc(c.publishedAt)}">${date(c.publishedAt)}</time></div>
    <${tag}><a href="${esc(c.url)}" rel="noopener" target="_blank">${headline(c)}</a></${tag}><p>${summary(c)}</p>
    ${original}</article>`;
}
// The lead is the latest first-party report from the past three days, falling back to the newest item.
const lead = cards.find(c => c.official && Date.parse(updatedAt)-Date.parse(c.publishedAt)<3*86400000) ?? cards[0]!;
const filters = CATEGORIES.filter(c => cards.some(item=>item.category===c.key)).map(c => `<button data-filter="${esc(c.key)}" aria-pressed="false">${esc(c.label)}</button>`).join("");
const sourceRows = sources.map(s=>`<tr><th scope="row">${esc(s.name)}</th><td>${s.ok ? (s.found ? "已抓取" : "暂无新增") : "本轮未取到"}</td><td>${s.found}</td><td>${s.published}</td></tr>`).join("");
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(SITE.name)} · 品牌与市场营销热点</title><meta name="description" content="追踪近七天品牌经营、广告投放、行业研究与监管动态，直达官方和行业媒体原文。">
<meta name="theme-color" content="#143c39"><link rel="icon" href="./logo.svg"><link rel="stylesheet" href="./reader.css"></head>
<body><header><div class="wrap mast"><a class="brand" href="./"><img src="./logo.svg" width="38" height="38" alt="">Market Hot</a><a class="source-link" href="#sources">信源状态 ↓</a></div></header>
<main class="wrap"><section class="intro"><div><div class="edition">行业观察</div><h1>品牌与市场营销热点</h1></div><div class="stamp">北京时间 <time datetime="${esc(updatedAt)}">${updated}</time> 更新<br>近七天 · ${cards.length} 篇</div></section>
<nav aria-label="筛选栏目" hidden><button data-filter="all" aria-pressed="true">全部</button>${filters}</nav>
<div id="stories">${article(lead,true)}<div class="grid">${cards.filter(c=>c!==lead).map(c=>article(c)).join("")}</div></div>
<section id="sources"><details><summary>本轮信源状态 <span>${ok} / ${sources.length} 抓取成功</span></summary><p>每六小时尝试更新。首页按原始发布日期收录近七天有来源摘要或正文依据的条目；已校订的译文可展开查看原标题，其余英文报道可按需展开机器翻译。</p><table><thead><tr><th>来源</th><th>状态</th><th>发现</th><th>上页</th></tr></thead><tbody>${sourceRows}</tbody></table></details></section></main>
<footer class="wrap"><b>Market Hot</b><span>原文版权归各来源所有</span><a href="https://github.com/LiChang1125/Market-Hot">GitHub ↗</a></footer>
<script src="./filter.js"></script></body></html>`;
await mkdir(out,{recursive:true});
await Promise.all([
  writeFile(out+"/index.html",html),
  copyFile("scripts/pages/reader.css",out+"/reader.css"), copyFile("scripts/pages/filter.js",out+"/filter.js"),
  copyFile("site/brand/logo.svg",out+"/logo.svg"), writeFile(out+"/digest.json", JSON.stringify({ updatedAt, sources, cards }))
]);
