export const sections: Record<string, string> = {
  advertising: "广告投放", crm: "客户营销", conversion: "转化与留存", discovery: "站内发现",
};

export const products = [
  { slug: "google", name: "Google & YouTube", category: "advertising" },
  { slug: "facebook", name: "Facebook & Instagram", category: "advertising" },
  { slug: "tiktok", name: "TikTok", category: "advertising" },
  { slug: "pinterest", name: "Pinterest", category: "advertising" },
  { slug: "klaviyo-email-marketing", name: "Klaviyo", category: "crm" },
  { slug: "mailchimp", name: "Mailchimp", category: "crm" },
  { slug: "omnisend", name: "Omnisend", category: "crm" },
  { slug: "smile-io", name: "Smile", category: "conversion" },
  { slug: "loox", name: "Loox", category: "conversion" },
  { slug: "searchanise", name: "Searchanise", category: "discovery" },
];

export interface Plan { name: string; price: string; features: string[] }
export const hasFreeOffer = (plan: Plan) => plan.price.toLowerCase() === "free" || /free trial/i.test(plan.price);
/** Compare only explicit recurring prices in the same currency. Installation-only offers have no monthly price. */
export function monthlyPrice(plan: Plan): { currency: string; amount: number } | null {
  const match = /([\d,]+(?:\.\d+)?)\s+([A-Z]{3})\s*\/\s*month\b/.exec(plan.price);
  return match ? { currency: match[2]!, amount: Number(match[1]!.replaceAll(",", "")) } : null;
}
export function startingPrice(tool: Tool, currency: string): number {
  if (tool.plans.some(p => p.price.toLowerCase() === "free")) return 0;
  const amounts = tool.plans.map(monthlyPrice).filter(p => p?.currency === currency).map(p => p!.amount);
  return Math.min(...amounts);
}
export interface Observation {
  title: string; rating: number; reviews: number; plans: Plan[];
}
export interface Tool extends Observation {
  slug: string; name: string; category: string; checked: string;
}
export const sourceUrl = (slug: string) => "https://apps.shopify.com/" + encodeURIComponent(slug);
