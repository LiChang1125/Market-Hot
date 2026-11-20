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
export interface Observation {
  title: string; rating: number; reviews: number; plans: Plan[];
}
export interface Tool extends Observation {
  slug: string; name: string; category: string; checked: string;
}
export const sourceUrl = (slug: string) => "https://apps.shopify.com/" + encodeURIComponent(slug);
