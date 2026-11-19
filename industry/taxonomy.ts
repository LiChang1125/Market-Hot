// 分类 key 用于站点、RSS 和公开 API。
export const CATEGORIES = [
  {"key": "brand-strategy", "label": "品牌战略", "section": "品牌战略", "tagColor": "orange", "guide": "预算、品牌组合、定位、定价、渠道或组织的经营决策。"},
  {"key": "media-buying", "label": "媒介与投放", "section": "媒介与投放", "tagColor": "indigo", "guide": "广告支出、库存交易、增量测量、归因和投放效果。"},
  {"key": "ad-platforms", "label": "平台与工具", "section": "平台与工具", "tagColor": "turquoise", "guide": "改变定向、出价、素材生产或分发的平台规则与产品更新。"},
  {"key": "consumer-insights", "label": "消费者研究", "section": "消费者研究", "tagColor": "violet", "guide": "有样本、时间范围或方法的消费者行为与需求研究。"},
  {"key": "agencies", "label": "代理与咨询", "section": "代理与咨询", "tagColor": "purple", "guide": "代理集团及咨询机构的策略、服务模式、并购与客户预算流向。报告优先按研究对象归类。"},
  {"key": "regulation", "label": "监管与标准", "section": "监管与标准", "tagColor": "green", "guide": "广告合规、执法、政策征询、标准与生效范围。"},
] as const;

export const RELEASE: { category: string; tag: string; unit: string } | null = { category: "ad-platforms", tag: "平台更新", unit: "项平台更新" };
export const PLAIN_TERMS: readonly string[] = ["cpm", "cpc", "roi", "roas", "cmo", "ctr", "crm", "api"];
export const ITEM_TYPES = ["policy_change", "product_launch", "measurement_method", "research_report", "industry_event", "opinion_analysis", "case_study"] as const;
export const CATEGORY_TAGS = ["品牌战略", "投放测量", "平台更新", "消费者研究", "代理业动态", "政策/监管", "研究报告", "案例复盘", "行业观点", "其他"] as const;
export const TOPIC_TAGS = ["媒介预算", "零售媒体", "增量测量", "广告归因", "品牌安全", "创意生产", "一方数据", "渠道策略", "消费者行为", "广告披露", "隐私合规"] as const;
export const ENTITY_TAGS = ["可口可乐", "宝洁", "联合利华", "WPP", "Omnicom", "Publicis", "Interpublic", "Dentsu", "Accenture Song", "McKinsey", "Bain", "BCG", "Google", "Meta", "TikTok", "小红书", "抖音", "FTC", "CMA", "IAB", "中国广告协会", "市场监管总局"] as const;
export const TAG_SYNONYMS: Readonly<Record<string, string>> = { 监管: "政策/监管", 归因: "广告归因", 定位: "品牌战略", 研究: "研究报告", 测量: "投放测量", 更新: "平台更新" };

export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[]; orgNames?: string[]; otherNames?: string[] }> = {
  "coca-cola": { name: "可口可乐", displayTag: "可口可乐", aliases: ["可口可乐", "Coca-Cola", "The Coca-Cola Company"] },
  pg: {"name": "宝洁", "displayTag": "宝洁", "aliases": ["宝洁", "P&G", "Procter & Gamble"], "orgNames": ["宝洁"]},
  unilever: {"name": "联合利华", "displayTag": "联合利华", "aliases": ["联合利华", "Unilever"], "orgNames": ["联合利华"]},
  wpp: {"name": "WPP", "displayTag": "WPP", "aliases": ["WPP", "WPP集团"], "orgNames": ["WPP"]},
  omnicom: {"name": "Omnicom", "displayTag": "Omnicom", "aliases": ["Omnicom", "宏盟"], "orgNames": ["Omnicom"]},
  publicis: {"name": "Publicis", "displayTag": "Publicis", "aliases": ["Publicis", "阳狮"], "orgNames": ["Publicis"]},
  ipg: {"name": "Interpublic", "displayTag": "Interpublic", "aliases": ["Interpublic", "IPG", "埃培智"], "orgNames": ["Interpublic"]},
  dentsu: {"name": "Dentsu", "displayTag": "Dentsu", "aliases": ["Dentsu", "电通"], "orgNames": ["Dentsu"]},
  accenture: {"name": "Accenture Song", "displayTag": "Accenture Song", "aliases": ["Accenture Song", "埃森哲宋", "埃森哲互动"], "orgNames": ["Accenture Song"]},
  mckinsey: {"name": "McKinsey", "displayTag": "McKinsey", "aliases": ["McKinsey", "麦肯锡"], "orgNames": ["McKinsey"]},
  bain: {"name": "Bain", "displayTag": "Bain", "aliases": ["Bain", "贝恩"], "orgNames": ["Bain"]},
  bcg: {"name": "BCG", "displayTag": "BCG", "aliases": ["BCG", "波士顿咨询", "Boston Consulting Group"], "orgNames": ["BCG"]},
  google: {"name": "Google", "displayTag": "Google", "aliases": ["Google", "Google Ads", "谷歌"], "orgNames": ["Google"]},
  meta: {"name": "Meta", "displayTag": "Meta", "aliases": ["Meta", "Meta for Business"], "orgNames": ["Meta"]},
  tiktok: {"name": "TikTok", "displayTag": "TikTok", "aliases": ["TikTok", "TikTok for Business"], "orgNames": ["TikTok"]},
  xiaohongshu: {"name": "小红书", "displayTag": "小红书", "aliases": ["小红书", "聚光平台"], "orgNames": ["小红书"]},
  douyin: {"name": "抖音", "displayTag": "抖音", "aliases": ["抖音", "巨量引擎", "Ocean Engine"], "orgNames": ["抖音"]},
  ftc: {"name": "FTC", "displayTag": "FTC", "aliases": ["FTC", "Federal Trade Commission", "美国联邦贸易委员会"], "orgNames": ["FTC"]},
  cma: {"name": "CMA", "displayTag": "CMA", "aliases": ["CMA", "Competition and Markets Authority", "英国竞争与市场管理局"], "orgNames": ["CMA"]},
  iab: {"name": "IAB", "displayTag": "IAB", "aliases": ["IAB", "Interactive Advertising Bureau", "互动广告局"], "orgNames": ["IAB"]},
  caa: {"name": "中国广告协会", "displayTag": "中国广告协会", "aliases": ["中国广告协会", "中广协"], "orgNames": ["中国广告协会"]},
  samr: {"name": "市场监管总局", "displayTag": "市场监管总局", "aliases": ["市场监管总局", "国家市场监督管理总局", "广告监管司"], "orgNames": ["市场监管总局"]},
};
export const IDENTITY_LEXICON = [
  { id: "coca-cola", name: "可口可乐", patterns: [/可口可乐|\bcoca-cola\b/i] },
  { id: "pg", name: "宝洁", patterns: [/宝洁/i, /\bP&G\b/i, /\bProcter & Gamble\b/i] },
  { id: "unilever", name: "联合利华", patterns: [/联合利华/i, /\bUnilever\b/i] },
  { id: "wpp", name: "WPP", patterns: [/\bWPP\b/i, /WPP集团/i] },
  { id: "omnicom", name: "Omnicom", patterns: [/\bOmnicom\b/i, /宏盟/i] },
  { id: "publicis", name: "Publicis", patterns: [/\bPublicis\b/i, /阳狮/i] },
  { id: "ipg", name: "Interpublic", patterns: [/\bInterpublic\b/i, /\bIPG\b/i, /埃培智/i] },
  { id: "dentsu", name: "Dentsu", patterns: [/\bDentsu\b/i, /电通/i] },
  { id: "accenture", name: "Accenture Song", patterns: [/\bAccenture Song\b/i, /埃森哲宋/i, /埃森哲互动/i] },
  { id: "mckinsey", name: "McKinsey", patterns: [/\bMcKinsey\b/i, /麦肯锡/i] },
  { id: "bain", name: "Bain", patterns: [/\bBain\b/i, /贝恩/i] },
  { id: "bcg", name: "BCG", patterns: [/\bBCG\b/i, /波士顿咨询/i, /\bBoston Consulting Group\b/i] },
  { id: "google", name: "Google", patterns: [/\bGoogle\b/i, /\bGoogle Ads\b/i, /谷歌/i] },
  { id: "meta", name: "Meta", patterns: [/\bMeta\b/i, /\bMeta for Business\b/i] },
  { id: "tiktok", name: "TikTok", patterns: [/\bTikTok\b/i, /\bTikTok for Business\b/i] },
  { id: "xiaohongshu", name: "小红书", patterns: [/小红书/i, /聚光平台/i] },
  { id: "douyin", name: "抖音", patterns: [/抖音/i, /巨量引擎/i, /\bOcean Engine\b/i] },
  { id: "ftc", name: "FTC", patterns: [/\bFTC\b/i, /\bFederal Trade Commission\b/i, /美国联邦贸易委员会/i] },
  { id: "cma", name: "CMA", patterns: [/\bCMA\b/i, /\bCompetition and Markets Authority\b/i, /英国竞争与市场管理局/i] },
  { id: "iab", name: "IAB", patterns: [/\bIAB\b/i, /\bInteractive Advertising Bureau\b/i, /互动广告局/i] },
  { id: "caa", name: "中国广告协会", patterns: [/中国广告协会/i, /中广协/i] },
  { id: "samr", name: "市场监管总局", patterns: [/市场监管总局/i, /国家市场监督管理总局/i, /广告监管司/i] },
];
export const PUBLISHER_DOMAINS = [
  { entityId: "coca-cola", domains: ["coca-colacompany.com"] },
  {"entityId": "pg", "domains": ["pg.com"]},
  {"entityId": "unilever", "domains": ["unilever.com"]},
  {"entityId": "wpp", "domains": ["wpp.com"]},
  {"entityId": "omnicom", "domains": ["omc.com"]},
  {"entityId": "publicis", "domains": ["publicisgroupe.com"]},
  {"entityId": "ipg", "domains": ["interpublic.com"]},
  {"entityId": "dentsu", "domains": ["group.dentsu.com"]},
  {"entityId": "mckinsey", "domains": ["mckinsey.com"]},
  {"entityId": "bain", "domains": ["bain.com"]},
  {"entityId": "bcg", "domains": ["bcg.com"]},
  {"entityId": "google", "domains": ["blog.google"]},
  {"entityId": "meta", "domains": ["about.fb.com"]},
  {"entityId": "tiktok", "domains": ["newsroom.tiktok.com"]},
  {"entityId": "xiaohongshu", "domains": ["xiaohongshu.com"]},
  {"entityId": "douyin", "domains": ["oceanengine.com"]},
  {"entityId": "ftc", "domains": ["ftc.gov"]},
  {"entityId": "iab", "domains": ["iab.com"]},
  {"entityId": "caa", "domains": ["china-caa.org"]},
  {"entityId": "samr", "domains": ["samr.gov.cn"]},
];
export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [];
