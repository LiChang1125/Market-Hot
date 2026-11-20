// One-time migration of a previously published Market Hot Pages digest. Never fetches or invents stories.
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { closeDb, sql } from "@aihot/backend/db";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { searchContent, overrideFields } from "@aihot/backend/admin/content";
import { groupArticle } from "@aihot/backend/events/group";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { CATEGORIES } from "@aihot/industry/taxonomy";
import sources from "../industry/sources.json" with {type:"json"};

const picks: Record<string,string> = {
  "聚焦老年群体权益保护，巨量引擎升级涉老营销治理规则":"规则涉及涉老广告的收益承诺，广告主可据原文复核素材。",
  "Walmart Sees Weakest Global Ad Sales Growth in 2 Years":"沃尔玛广告业务同比增长 25%，披露的数据可用于跟踪零售媒体增速。",
  "CMA provisionally finds that viagogo may have broken the law on hidden fees":"英国监管机构公布了对强制收费展示方式的初步调查结果。",
  "Our Approach to Updating Our Commercial Terms of Service":"Meta 在官方新闻室说明了商业服务条款修订的下一步。",
  "Win the holiday shopping season with November’s Demand Gen Drop.":"Google Ads 发布了面向假日购物季的 Demand Gen 广告更新。",
  "The Creator Economy’s Next Chapter":"IAB 报告提供了创作者营销预算的历史数据和预测。",
  "How the global agency groups performed in Q3 2026":"Campaign Asia 对照了主要代理集团的季度业绩。",
};
const edited: Record<string,[string,string]>={
  "Walmart Sees Weakest Global Ad Sales Growth in 2 Years":["沃尔玛全球广告业务同比增长 25%，增速为两年来最低","Adweek 报道，沃尔玛全球广告业务同比增长 25%，是该业务自 2024 年以来的最低增速。"],
};
const card=z.object({sourceId:z.string(),url:z.url({protocol:/^https?$/}),title:z.string().min(1),summary:z.string().min(1),
  category:z.enum(CATEGORIES.map(c=>c.key) as [string,...string[]]),publishedAt:z.iso.datetime({offset:true}),reviewed:z.boolean().optional(),
  titleZh:z.string().optional(),summaryZh:z.string().optional()});
const input=z.object({cards:z.array(card).max(500)}).parse(JSON.parse(await readFile(process.argv[2]!, "utf8")));
try{
  let imported=0;
  for(const row of input.cards){
    if(!sources.sources.some(s=>s.id===row.sourceId)) throw Error("Unknown source "+row.sourceId);
    const [existing]=await searchContent(row.url);
    const id=existing?.id || (await upsertMaterial({sourceId:row.sourceId,url:row.url,title:row.title,excerpt:row.summary,
      publishedAt:new Date(row.publishedAt),publicationTime:row.publishedAt,via:"import"})).articleId;
    const translation=edited[row.title] || (row.reviewed && row.titleZh && row.summaryZh ? [row.titleZh,row.summaryZh] : [row.title,row.summary]);
    const reason=Object.hasOwn(picks,row.title)?picks[row.title]:undefined;
    await sql`INSERT INTO editorial_overrides(article_id,fields,reason,updated_by)
      VALUES(${id},'{"relevance":"pass"}'::jsonb,'迁移已发布的阅读版条目','market-hot-import')
      ON CONFLICT(article_id) DO NOTHING`;
    const [record]=await sql`SELECT version FROM editorial_overrides WHERE article_id=${id} AND updated_by='market-hot-import' AND NOT (fields ? 'title')`;
    if(!record)continue;
    await overrideFields(id,{fields:{title:translation[0],summary:translation[1],category:row.category,selected:!!reason,...(reason?{reason}:{})},
      reason:"阅读版迁移与编辑复核",version:record.version},"market-hot-import");
    if(reason)await groupArticle(id);
    imported++;
  }
  console.log("Imported",imported,"previously published articles.");
} finally{await stopBoss();await closeDb()}
