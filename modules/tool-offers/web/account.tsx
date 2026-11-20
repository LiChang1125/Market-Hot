import {useEffect,useState} from "react";
import {getStarred,replaceStarred} from "@aihot/web/lib/local-state";
import {ToolPage} from "../../tool-rank/web/layout";
import {accountRequest,readAccount,localClaims,saveClaims,type Entry} from "./library";
export const handle={tab:"me",name:"读者账号"};
export const meta=()=>[{title:"读者账号与同步 · Market Hot"}];
export default function Account(){
  const [signed,setSigned]=useState(false),[code,setCode]=useState(""),[created,setCreated]=useState(""),[msg,setMsg]=useState(""),[busy,setBusy]=useState(false);
  useEffect(()=>{readAccount().then(d=>setSigned(d.signedIn)).catch(e=>setMsg(e.message))},[]);
  async function run(action:()=>Promise<void>){setBusy(true);setMsg("");try{await action()}catch(e){setMsg(String(e))}finally{setBusy(false)}}
  async function sync(){
    const remote=await readAccount();if(!remote.signedIn)throw Error("请先登录。");
    const stars=new Map(getStarred().map(s=>[s.id,s])),claims=localClaims();
    for(const e of remote.entries){
      if(e.kind==="star" && (!stars.has(e.key)||stars.get(e.key)!.savedAt<e.value.savedAt)) stars.set(e.key,e.value);
      if(e.kind==="claim" && (!claims[e.key]||claims[e.key]!.at<e.value.at)) claims[e.key]=e.value;
    }
    const entries:Entry[]=[...Array.from(stars.values(),s=>({kind:"star" as const,key:s.id,value:s})),
      ...Object.entries(claims).map(([key,value])=>({kind:"claim" as const,key,value}))];
    for(let i=0;i<entries.length;i+=200)await accountRequest("entries",entries.slice(i,i+200));
    if(!replaceStarred([...stars.values()]))throw Error("本机收藏无法写入。");
    saveClaims(claims);setMsg("同步完成，共 "+stars.size+" 条收藏和 "+Object.keys(claims).length+" 条额度记录。");
  }
  return <ToolPage title="读者账号与同步" back={{to:"/more",label:"我的"}}>
    {signed?<><p>已登录。可以将此设备的收藏和额度记录与云端合并。</p>
      <button className="market-button" disabled={busy} onClick={()=>run(sync)}>同步收藏与卡册</button>{" "}
      <button className="market-button" disabled={busy} onClick={()=>run(async()=>{await accountRequest("logout",{});setSigned(false);setCreated("");setCode("")})}>退出登录</button></>:
      <><p>首次使用可创建专属登录码。换设备时输入同一个登录码，即可取回同步过的收藏和卡册。</p>
      <div className="market-controls"><button className="market-button" disabled={busy} onClick={()=>run(async()=>{const r=await accountRequest<{code:string}>("create",{});setCreated(r.code);setSigned(true)})}>创建读者账号</button></div>
      <form className="market-controls" onSubmit={e=>{e.preventDefault();run(async()=>{await accountRequest("login",{code:code.trim()});setSigned(true);setCode("")})}}>
        <label>已有登录码 <input type="password" value={code} autoComplete="current-password" onChange={e=>setCode(e.target.value)}/></label>
        <button className="market-button" disabled={busy||!code.trim()}>登录</button>
      </form></>}
    {created&&<section className="market-card"><h2>保存你的登录码</h2><p>仅在创建时显示一次，持有码的人可以登录此账号。</p><code style={{overflowWrap:"anywhere"}}>{created}</code></section>}
    <p role="status">{msg}</p>
  </ToolPage>;
}
