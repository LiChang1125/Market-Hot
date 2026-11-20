import type {LocalStarredItem} from "@aihot/web/lib/local-state";
export interface Claim {slug:string;plan:string;at:string}
export type Entry={kind:"claim";key:string;value:Claim}|{kind:"star";key:string;value:LocalStarredItem};
export async function accountRequest<T>(path:string,body?:unknown):Promise<T>{
  const res=await fetch("/api/market-account/"+path,{credentials:"same-origin",cache:"no-store",...(body===undefined?{}:{
    method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body),
  })});
  if(!res.ok) throw new Error(res.status===401?"登录码无效或会话已结束。":"保存失败，请重试。");
  return res.json();
}
export const readAccount=()=>accountRequest<{signedIn:boolean;account?:string;entries:Entry[]}>("");
export function localClaims():Record<string,Claim>{
  try{return JSON.parse(localStorage.getItem("market-claims")||"{}") || {}}catch{return {}}
}
export function saveClaims(values:Record<string,Claim>){localStorage.setItem("market-claims",JSON.stringify(values))}
