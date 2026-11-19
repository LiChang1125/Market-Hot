# Market Hot

中文品牌与市场营销热点站。读者可以从精选、热点榜、主题、日报、周报或月报进入原始报道，也可以订阅分类 RSS，或通过公开 API 与 MCP 阅读。

[打开 Market Hot 免费阅读版](https://lichang1125.github.io/Market-Hot/)。首页展示近七天的报道、来源、原始发布时间和原文链接。GitHub Actions 每六小时尝试更新一次；若新一期可用来源或近期报道不足，网站继续展示上一期。页面底部可查看各来源本期采集情况。

## 编辑范围

站点跟踪品牌战略、媒介与投放、平台与工具、消费者研究、代理与咨询、监管与标准六类变化。重点是哪些预算、规则、方法或消费者行为发生了变化，以及原文提供了什么证据。转载按事件归并，摘要链接到原文。

## 信源与接入状态

以 [实际导入配置](industry/sources.json) 为准。首次启动由 seed 导入，之后的增补保留管理员已有设置。

| 配置状态 | 来源与方式 |
| --- | --- |
| 官方 RSS 或网页列表 | 宝洁、可口可乐、WPP、WPP Media、Omnicom、Publicis、Dentsu、Accenture Song、McKinsey、Bain、BCG、Google Ads & Commerce、Meta 新闻室、FTC、CMA、IAB、中国广告协会、市场监管总局广告监管司。集团通用源经行业预筛。原 Interpublic 新闻入口已跳转到 Omnicom，统一采集，主题库保留 Interpublic。 |
| 行业媒体 RSS 或网页列表 | Campaign Asia-Pacific、Adweek、The Drum、Digiday、Morketing、SocialBeta、刀法研究所（数英作者专栏）。 |
| 已配置，默认暂停 | Marketing Week 的 RSS 在验证环境返回 403。X 仅配置分析师 Eric Seufert 和记者 Lara O’Reilly，启用前设置 SocialData 密钥与额度。 |
| 等待接入的外部推送 | Think with Google、Meta for Business 专栏、TikTok Newsroom、小红书商业化、巨量引擎、36氪及虎嗅的品牌营销栏目。当前仅预留各自的 sourceId；接通授权订阅或栏目供稿后在后台启用。只向相应来源推送该发布方的原文。 |

没有明确全文许可的来源只公开摘要和原文链接。付费服务和采集需在部署环境单独开启。列表能返回标题并不保证每篇文章都能取得日期与正文；后台“信源”可预览、诊断和暂停。进入精选还需要完成评分和去重。

## 本机运行与部署

需要 Node.js 24.22.1 或更高版本及 PostgreSQL，或使用 Docker Compose。按 [部署指南](docs/deploy.md) 配置数据库、管理员和模型服务，把 `SITE_URL` 设置为实际访问地址。带密钥的配置仅在部署环境保存。

```sh
npm ci
npm run typecheck
DATABASE_URL=postgres://localhost/markethot_test npm test
npm run build -w @aihot/web
npm run test:web
node scripts/smoke.ts --base http://localhost:3000
```

测试库名须以 `_test` 或 `_ci` 结尾，测试用户需要建库权限。冒烟检查访问已启动的完整服务。免费阅读版由 GitHub Pages 托管；如需后台、实时 API 和 MCP，可按部署指南运行完整服务。

## 上线前由运营者确认

- 栏目、重点品牌和地区，以及 X 名单和可选订阅预算。
- 从实际来稿标注 100–200 篇「该选／不该选」，用 [精选评测](docs/selection.md) 校准门槛。当前沿用框架初始值，例题仅供对照格式。
- 部署域名、运营主体、联系方式、日志保留和隐私条款，模型提供方、采集频率与付费上限。

本项目基于 [AIHOT 开源框架](https://github.com/KKKKhazix/AIHOT) 提供的 MIT 许可代码。上游版本为 `88b114d7efbcdee17c3fc4d2e29c27672178e10a`。参见 [LICENSE](LICENSE) 与 [NOTICE](NOTICE)。
