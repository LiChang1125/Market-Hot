// The free reader uses explicit editorial rules and original-source excerpts.
// The model-scored edition continues to use the prompts in industry/prompts/.
const beats: Array<[string, RegExp]> = [
  ["regulation", /广告监管|广告法|广告审查|监管|虚假宣传|广告标准|advertising standard|commercial terms|consumer protection|price transparency|deceptive|advertis.{0,40}(investigation|settlement)|auction.rigging|hidden fees/i],
  ["ad-platforms", /投放工具|广告产品|商业化平台|素材工具|广告平台|广告主工具|demand gen|performance max|google ads|ads manager|ad platform|auction system|creative tool/i],
  ["media-buying", /媒介预算|广告预算|投放|广告收入|媒介采购|归因|媒介代理|ad spend|ad sales|media agency|media buying|media investment|marketing budget|advertisers|attribution|retail media|creator marketing/i],
  ["consumer-insights", /消费者|消费行为|购物习惯|消费调研|品牌忠诚|consumer (study|survey|behavio[u]?r|confidence|spending|research)|shopper(s|'s)? (research|survey|behavio[u]?r)|customer loyalty/i],
  ["agencies", /代理商|代理集团|比稿|媒介代理|agency (group|acquisition|business|review|roster|pitch)|media mandate|creative account/i],
  ["brand-strategy", /品牌|渠道策略|零售策略|营销|brand (strategy|positioning|builders|investment|portfolio|growth)|brands? must|sports marketing|marketing strategy|agentic commerce|loyalty program/i],
];
const noise = /招聘|联名官宣|视觉赏析|海报赏析|获奖|荣获|奖项揭晓|登录查看|每日监测|股价|top (?:10|ten)|\bawards?\b|press release distribution|stock price|sponsored (?:by|content)|partner content|job opening|daily cable news ratings/i;
const modelLaunch = /模型发布|发布.{0,8}大模型|(?:introduc|launch|releas)\w*.{0,30}(?:language model|LLM|GPT-[\d.]+)/i;
const directUse = /广告投放|内容生产|素材生产|广告创意|ad buying|ad creative|creative production|ad targeting/i;

export function readingBeat(title: string, context: string, source: string): string | null {
  if (noise.test(title) || (modelLaunch.test(title) && !directUse.test(title + " " + context))) return null;
  if (/成立盛典|园区巡礼|how to find the best .{0,25}deals/i.test(title)) return null;
  for (const [key, pattern] of beats) if (pattern.test(title)) return key;
  // Broad newsroom feeds need a clear marketing connection in the source copy.
  for (const [key, pattern] of beats) if (pattern.test(context)) return key;
  if (source === "samr-ads") return "regulation";
  return null;
}
