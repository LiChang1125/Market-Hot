import {useEffect,useState} from "react";
import {getStarred,replaceStarred} from "@aihot/web/lib/local-state";
import {ToolPage} from "@aihot/site/brand/ToolPage.tsx";
import {accountRequest,readAccount,localClaims,saveClaims,syncSnapshot,type Entry} from "./library";
export const handle={tab:"me",name:"读者账号"};
export const meta=()=>[{title:"读者账号与同步 · Market Hot"}];
export default function Account(){
  const [signed,setSigned]=useState(false),[code,setCode]=useState(""),[created,setCreated]=useState(""),[msg,setMsg]=useState(""),[busy,setBusy]=useState(false);
  useEffect(()=>{readAccount().then(d=>setSigned(d.signedIn)).catch(e=>setMsg(e.message))},[]);
  async function run(action:()=>Promise<void>){setBusy(true);setMsg("");try{await action()}catch(e){setMsg(String(e))}finally{setBusy(false)}}
  async function sync(){
    const remote=await readAccount();if(!remote.account)throw Error("请先登录。");
    const snapshot=syncSnapshot(remote.account);
    const previous=snapshot.stamps;
    const entries:Entry[]=[...getStarred().map(value=>({kind:"star" as const,key:value.id,value})),
      ...Object.entries(localClaims()).map(([key,value])=>({kind:"claim" as const,key,value}))];
    const id=(e:Entry)=>e.kind+"/"+e.key;
    const stamp=(e:Entry|undefined)=>e?.kind==="star"?e.value.savedAt:e?.value.at;
    const local=new Map(entries.map(e=>[id(e),e]));
    const cloud=new Map(remote.entries.map(e=>[id(e),e]));
    const changes=[];
    for(const key of new Set([...Object.keys(previous),...local.keys()])){
      const here=local.get(key),there=cloud.get(key),last=previous[key];
      if(stamp(here)===last || stamp(here)===stamp(there))continue;
      if(stamp(there)!==last && (!here || (there && stamp(there)!>=stamp(here)!)))continue;
      if(here){changes.push(here);cloud.set(key,here)}
      else if(there){changes.push({kind:there.kind,key:there.key,value:null});cloud.delete(key)}
    }
    for(let i=0;i<changes.length;i+=200)await accountRequest("entries",changes.slice(i,i+200));
    const merged=[...cloud.values()];
    const stars=merged.flatMap(e=>e.kind==="star"?[e.value]:[]);
    const claims=Object.fromEntries(merged.flatMap(e=>e.kind==="claim"?[[e.key,e.value]]:[]));
    if(!replaceStarred(stars))throw Error("本机收藏无法写入。");
    saveClaims(claims);
    snapshot.save(Object.fromEntries(merged.map(e=>[id(e),stamp(e)!])));
    setMsg("同步完成，共 "+stars.length+" 条收藏和 "+Object.keys(claims).length+" 条额度记录。");
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
