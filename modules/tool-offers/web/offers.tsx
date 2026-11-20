import {useEffect,useState} from "react";
import {Link,useLoaderData,useLocation} from "react-router";
import {apiGet} from "@aihot/web/lib/api.server";
import {beijingStamp} from "@aihot/contracts/time";
import {sourceUrl,sections,type Tool} from "@aihot/site/marketing-tools";
import {ToolPage} from "@aihot/site/brand/ToolPage.tsx";
import {localClaims,saveClaims,readAccount,accountRequest,type Claim} from "./library";
export const handle={tab:"me",name:"免费额度"};
export const meta=()=>[{title:"营销工具免费额度与优惠 · Market Hot"}];
export async function loader({request}:{request:Request}){return apiGet<Tool[]>("/api/site/marketing-tools",{signal:request.signal})}
export default function Offers(){
  const tools=useLoaderData<typeof loader>(),album=useLocation().pathname.endsWith("/album");
  const [claims,setClaims]=useState<Record<string,Claim>>({}),[q,setQ]=useState(""),[group,setGroup]=useState(""),[message,setMessage]=useState(""),[pending,setPending]=useState(false);
  useEffect(()=>{setClaims(localClaims())},[]);
  const offers=tools.flatMap(t=>t.plans.filter(p=>p.price.toLowerCase()==="free" || /free trial/i.test(p.price)).map(p=>({t,p,key:t.slug+"/"+p.name})));
  async function toggle(t:Tool,plan:string,key:string){
    setPending(true);setMessage("");
    try{
      const next={...localClaims()};if(next[key])delete next[key];else next[key]={slug:t.slug,plan,at:new Date().toISOString()};
      const state=await readAccount();
      if(state.signedIn)await accountRequest("entries",[{kind:"claim",key,value:next[key]||null}]);
      saveClaims(next);setClaims(next);
    }catch(e){setMessage(String(e))}finally{setPending(false)}
  }
  return <ToolPage title={album?"我的优惠卡册":"营销工具免费额度与优惠"} back={{to:"/more",label:"我的"}}>
    <p>可从官方应用页开通的免费套餐。领取条件、额度和升级价格以工具提供方列示为准。</p>
    <div className="market-links"><Link aria-current={!album?"page":undefined} to="/free-tokens">全部优惠 · {offers.length}</Link><Link aria-current={album?"page":undefined} to="/free-tokens/album">我的卡册 · {Object.keys(claims).length}</Link><Link to="/reader-account">跨设备同步</Link><Link to="/feedback" state={{feedbackFor:"tool-offers"}}>提报优惠</Link></div>
    <div className="market-controls"><input type="search" aria-label="搜索优惠" placeholder="搜索工具或额度" value={q} onChange={e=>setQ(e.target.value)}/><select aria-label="用途" value={group} onChange={e=>setGroup(e.target.value)}><option value="">全部用途</option>{Object.entries(sections).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
    <div className="market-cards">{offers.filter(({t,p,key})=>(!album||claims[key])&&(!group||t.category===group)&&(t.name+" "+p.features.join(" ")).toLowerCase().includes(q.toLowerCase())).map(({t,p,key})=>
      <section className="market-card" key={key}><small>{sections[t.category]}</small><h2>{t.name}</h2><p>{p.name} · {p.price}</p>
      <ul>{p.features.map(f=><li key={f}>{f}</li>)}</ul><small>核验于 {beijingStamp(t.checked)}</small>
      <div className="market-links"><a href={sourceUrl(t.slug)+"#pricing"}>前往官方领取 ↗</a><button className="market-button" disabled={pending} aria-pressed={!!claims[key]} onClick={()=>toggle(t,p.name,key)}>{claims[key]?"撤销领取记录":"标记已领取"}</button></div></section>)}</div>
    {album&&!Object.keys(claims).length&&<p>开通免费套餐后，可在全部优惠中标记领取，记录会显示在这里。</p>}
    {album&&Object.entries(claims).filter(([key])=>!offers.some(o=>o.key===key)).map(([key,c])=><p key={key}>{c.slug} · {c.plan} · 已记录，当前套餐未列出</p>)}
    <p role="status">{message}</p>
  </ToolPage>;
}
