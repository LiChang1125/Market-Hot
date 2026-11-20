export const policies = [
  { id:"google-ads", name:"Google Ads", topic:"API 访问级别与操作额度", url:"https://developers.google.cn/google-ads/api/docs/api-policy/access-levels?hl=en", selector:".devsite-article-body", terms:"operations per day|sliding 24 hour|operations / day|operation limit" },
  { id:"analytics", name:"Google Analytics", topic:"Data API 配额", url:"https://developers.google.cn/analytics/devguides/reporting/data/v1/quotas?hl=en", selector:".devsite-article-body", terms:"tokens per|concurrent requests|server errors" },
  { id:"shopify", name:"Shopify", topic:"营销应用 API 限流", url:"https://shopify.dev/docs/api/usage/limits", selector:"main", terms:"points/second|points per second|leaky bucket|restore rate" },
  { id:"microsoft", name:"Microsoft Advertising", topic:"批量请求与服务限流", url:"https://learn.microsoft.com/en-us/advertising/guides/services-protocol?view=bingads-13", selector:"main", terms:"throttl|rate limit|requests per minute" },
];
export interface Check { platform:string; at:string; day:string; state:"baseline"|"unchanged"|"changed"|"failed"; evidence:string[]; prior:string[] }
