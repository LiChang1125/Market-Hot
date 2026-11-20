import { Link, useLoaderData } from "react-router";
import { apiGet } from "@aihot/web/lib/api.server";
import { beijingStamp } from "@aihot/contracts/time";
import { products, sourceUrl, sections, type Tool } from "../public.ts";
import { ToolPage } from "./layout";

export const handle = {tab:"tool-rank",name:"工具详情"};
export async function loader({params,request}:{params:{slug:string};request:Request}) {
  if (!products.some(t=>t.slug===params.slug)) throw new Response(null,{status:404});
  return apiGet<{tool:Tool;history:{day:string;rating:number;reviews:number}[]}>("/api/site/marketing-tools/"+params.slug,{signal:request.signal});
}
export const meta=({data}:{data?:{tool:Tool}})=>[{title:(data?.tool.name || "工具详情")+" · 营销工具榜 · Market Hot"}];
export default function Detail() {
  const {tool,history}=useLoaderData<typeof loader>();
  return <ToolPage title={tool.name} back={{to:"/leaderboard",label:"营销工具榜"}}>
    <p>{sections[tool.category]} · 商家评分 {tool.rating} / 5 · {tool.reviews.toLocaleString("zh-CN")} 条评论</p>
    <div className="market-links"><a href={sourceUrl(tool.slug)}>应用市场原始数据 ↗</a><Link to={"/all?q="+encodeURIComponent(tool.name)}>查看相关新闻</Link></div>
    <p className="market-muted">最近核验于北京时间 {beijingStamp(tool.checked)}</p>
    <h2>价格与额度</h2><div className="market-cards">{tool.plans.map((p,i)=><section className="market-card" key={i}><h3>{p.name}</h3><p>{p.price}</p><ul>{p.features.map(f=><li key={f}>{f}</li>)}</ul></section>)}</div>
    <h2>历史记录</h2><table><thead><tr><th>日期</th><th>评分</th><th>评论数</th></tr></thead><tbody>{history.map(h=><tr key={h.day}><td>{h.day}</td><td>{h.rating}</td><td>{h.reviews}</td></tr>)}</tbody></table>
  </ToolPage>;
}
