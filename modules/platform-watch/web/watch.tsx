import {Link,useLoaderData,useSearchParams} from "react-router";
import {apiGet} from "@aihot/web/lib/api.server";
import {beijingDate,beijingStamp,isValidDate} from "@aihot/contracts/time";
import {ToolPage} from "../../tool-rank/web/layout";
import {policies,type Check} from "../public.ts";
export const handle={tab:"me",name:"平台监控"};
export const meta=()=>[{title:"广告平台额度与政策变更监控 · Market Hot"}];
export async function loader({params,request}:{params:{platform?:string;day?:string};request:Request}){
  const policy=policies.find(p=>p.id===(params.platform||policies[0]!.id));
  if(!policy || (params.day && !isValidDate(params.day))) throw new Response(null,{status:404});
  return {policy,day:params.day||"",today:beijingDate(Date.now()),checks:(await apiGet<Check[]>("/api/site/platform-watch",{signal:request.signal})).filter(c=>c.platform===policy.id)};
}
const labels={baseline:"首次核验",unchanged:"规则未变化",changed:"规则文本有变化",failed:"本轮未能核验"};
export default function Watch(){
  const {policy,day,today,checks}=useLoaderData<typeof loader>();
  const [search,setSearch]=useSearchParams();
  const requested=search.get("month")||day.slice(0,7)||today.slice(0,7);
  const month=/^\d{4}-(0[1-9]|1[0-2])$/.test(requested)?requested:today.slice(0,7);
  const last=new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5)),0)).getUTCDate();
  const history=checks.filter(c=>day?c.day===day:c.state==="baseline"||c.state==="changed");
  const latest=checks[0];
  return <ToolPage title="广告平台额度与政策变更监控" back={{to:"/more",label:"我的"}}>
    <nav aria-label="监控平台" className="market-links">{policies.map(p=><Link key={p.id} aria-current={p.id===policy.id?"page":undefined} to={"/resets/"+p.id}>{p.name}</Link>)}</nav>
    <h2>{policy.topic}</h2>
    <p>{latest?labels[latest.state]+" · 最近检查 "+beijingStamp(latest.at):"等待首次核验"}</p>
    <a className="market-action" href={policy.url}>查看平台官方规则 ↗</a>
    <h2>监控日历</h2><label>月份 <input type="month" value={month} onChange={e=>setSearch({month:e.target.value})}/></label>
    <div className="market-calendar">{Array.from({length:last},(_,i)=>{
      const date=month+"-"+String(i+1).padStart(2,"0");
      const records=checks.filter(c=>c.day===date);
      return records.length?<Link key={date} to={"/resets/"+policy.id+"/history/"+date} aria-label={date+" 有核验记录"} aria-current={day===date?"date":undefined}>{i+1}{records.some(c=>c.state==="changed")?" ●":" ·"}</Link>:<span key={date}>{i+1}</span>;
    })}</div>
    <h2>{day?day+" 核验记录":"历史变更"}</h2>
    {history.length===0&&<p className="market-muted">目前没有该时段的记录。</p>}
    {history.slice(0,40).map(c=><details key={c.at} className="market-card"><summary>{beijingStamp(c.at)} · {labels[c.state]}</summary>
      {c.state==="failed"?<p>本次没有取得可核对的官方规则。</p>:c.state==="unchanged"?<p>本次核验与上一版一致。</p>:<><h3>本次规则摘录</h3><ul>{c.evidence.map(x=><li key={x}>{x}</li>)}</ul></>}
      {c.prior.length>0&&<><h3>此前记录</h3><ul>{c.prior.filter(l=>!c.evidence.includes(l)).slice(0,5).map(x=><li key={x}>{x.slice(0,200)}</li>)}</ul></>}
    </details>)}
    <details><summary>监控时间与判定规则</summary><p>后台每六小时检查官方页面的额度和限流段落。日历记录本站观测时间。实际政策的生效时间、账户资格和适用地区以平台原文为准。</p></details>
  </ToolPage>;
}
