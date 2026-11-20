import { Link, useLoaderData, useLocation, useSearchParams } from "react-router";
import { apiGet } from "@aihot/web/lib/api.server";
import { sections, monthlyPrice, startingPrice, type Tool } from "@aihot/site/marketing-tools";
import { ToolPage } from "@aihot/site/brand/ToolPage.tsx";

export const handle = { tab: "tool-rank", name: "营销工具榜" };
export const meta = () => [{ title: "营销工具排行榜 · Market Hot" }];
export async function loader({ params, request }: {params:{category?:string};request:Request}) {
  if (params.category && !Object.hasOwn(sections, params.category)) throw new Response(null, {status:404});
  return { rows: await apiGet<Tool[]>("/api/site/marketing-tools", {signal:request.signal}), category: params.category || "" };
}

export default function Ranking() {
  const { rows, category } = useLoaderData<typeof loader>();
  const prices = useLocation().pathname === "/leaderboard/prices";
  const [params, setParams] = useSearchParams();
  function change(key:string, value:string) {
    const next=new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, {replace:true, preventScrollReset:true});
  }
  const q=(params.get("q") || "").trim().toLowerCase();
  const minimum=Number(params.get("min") || 0);
  const currencies=[...new Set(rows.flatMap(t=>t.plans.flatMap(p=>monthlyPrice(p)?.currency??[])))].sort();
  const currency=params.get("currency") || currencies[0] || "CNY";
  const sort=params.get("sort") || (prices?"price":"rating");
  const budget=params.get("budget");
  const list=rows.filter(t => (!category || t.category === category) && t.rating >= minimum &&
    [t.name,t.title,sections[t.category]].some(text=>text?.toLowerCase().includes(q)) &&
    (!params.has("free") || t.plans.some(p=>p.price.toLowerCase()==="free")) &&
    (!prices || !budget || startingPrice(t,currency)<=Number(budget)))
    .sort((a,b)=>(sort==="price"?startingPrice(a,currency)-startingPrice(b,currency):0) ||
      (sort==="reviews" ? b.reviews-a.reviews || b.rating-a.rating : b.rating-a.rating || b.reviews-a.reviews));
  return <ToolPage title={prices ? "营销工具价格" : "营销工具排行榜"}>
    <p className="market-muted">比较 Shopify 应用市场中营销工具的商家评分、评论数量与套餐。</p>
    <div className="market-links"><Link to="/leaderboard/rules">怎么算</Link><Link to="/leaderboard/sources">数据来源</Link></div>
    <nav aria-label="工具类别" className="market-links">
      <Link aria-current={!category && !prices ? "page":undefined} to="/leaderboard">综合</Link>
      {Object.entries(sections).map(([k,label])=><Link key={k} aria-current={category===k?"page":undefined} to={"/leaderboard/category/"+k}>{label}</Link>)}
      <Link to="/leaderboard/prices" aria-current={prices?"page":undefined}>价格</Link>
    </nav>
    <div className="market-controls">
      <input aria-label="搜索营销工具" type="search" placeholder="搜索营销工具" value={params.get("q") || ""} onChange={e=>change("q",e.target.value)}/>
      <label><input type="checkbox" checked={params.has("free")} onChange={e=>change("free",e.target.checked?"1":"")}/> 有免费套餐</label>
      <label>评分下限 <select value={minimum} onChange={e=>change("min",e.target.value)}>{[0,4,4.5,4.8,4.9].map(v=><option key={v} value={v}>{v || "不限"}</option>)}</select></label>
      {prices&&<><label>每月预算上限 <input type="number" min="0" aria-label="每月预算上限" placeholder="不限" value={budget??""} onChange={e=>change("budget",e.target.value)}/></label>
        <label>币种 <select value={currency} onChange={e=>change("currency",e.target.value)}>{currencies.map(c=><option key={c}>{c}</option>)}</select></label>
        <button className="market-button" onClick={()=>change("sort","price")}>按起始月费排序</button></>}
    </div>
    <h2>{category ? sections[category] : prices ? "当前套餐" : "综合榜"} <small>{list.length} 个工具</small></h2>
    <div className="table-scroll"><table><thead><tr><th>名次</th><th>工具</th><th><button onClick={()=>change("sort","rating")}>商家评分 {sort==="rating"?"↓":""}</button></th><th><button onClick={()=>change("sort","reviews")}>评论数 {sort==="reviews"?"↓":""}</button></th>{prices && <th>月费与条件</th>}</tr></thead>
      <tbody>{list.map((t,i)=><tr key={t.slug}><td>{i+1}</td><td><Link className="market-action" to={"/leaderboard/"+t.slug}>{t.name}</Link><br/><small>{sections[t.category]}</small></td><td>{t.rating.toFixed(1)} / 5</td><td>{t.reviews.toLocaleString("zh-CN")}</td>{prices&&<td>{t.plans.map(p=>p.price).join(" · ") || "见官方定价"}</td>}</tr>)}</tbody>
    </table></div>
    {!list.length&&<p>{rows.length?"没有符合筛选条件的工具。":"暂未采集到市场评分。"}</p>}
  </ToolPage>;
}
