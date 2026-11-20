import {createHash} from "node:crypto";
import {load} from "cheerio";
import {sql} from "@aihot/backend/db";
import {beijingDate} from "@aihot/contracts/time";
import type {ServerModule} from "@aihot/backend/modules";
import {policies, type Check} from "./public.ts";

export function ruleLines(html:string, policy:typeof policies[number]):string[] {
  const $=load(html);
  const term=new RegExp(policy.terms,"i");
  const root=$(policy.selector).first();
  root.find("nav,footer,aside,script,style,button").remove();
  const rows=root.find("tr,p,li").toArray().map(el=>
    el.tagName==="tr" ? $(el).find("th,td").toArray().map(cell=>$(cell).text().replace(/\s+/g," ").trim()).join(" · ") :
      $(el).text().replace(/\s+/g," ").trim()
  );
  return [...new Set(rows.filter(line=>line.length>15 && term.test(line)))].slice(0,12);
}

export async function refreshPolicies(){
  if(process.env.COLLECT_ENABLED!=="true") return {checked:0};
  let checked=0;
  for(const policy of policies){
    let evidence:string[]=[];
    try {
      const response=await fetch(policy.url,{signal:AbortSignal.timeout(18000)});
      if(!response.ok) throw Error("HTTP "+response.status);
      evidence=ruleLines(await response.text(),policy);
    } catch(err){console.warn("Policy monitor",policy.id,String(err))}
    const at=new Date();
    const fingerprint=evidence.length?createHash("sha256").update(JSON.stringify(evidence)).digest("hex"):null;
    await sql.begin(async tx=>{
      await tx`SELECT pg_advisory_xact_lock(hashtext(${"market-policy:"+policy.id}))`;
      const [prev]=await tx<{fingerprint:string;evidence:string[]}[]>`SELECT fingerprint,evidence FROM market_policy_checks
        WHERE platform=${policy.id} AND fingerprint IS NOT NULL ORDER BY checked_at DESC LIMIT 1`;
      const state=!fingerprint?"failed":!prev?"baseline":prev.fingerprint===fingerprint?"unchanged":"changed";
      await tx`INSERT INTO market_policy_checks(platform,checked_at,state,fingerprint,evidence,previous_evidence)
        VALUES(${policy.id},${at},${state},${fingerprint},${tx.json(evidence)},${tx.json(state==="changed"?prev!.evidence:[])})`;
    });
    if(fingerprint) checked++;
  }
  if(!checked) throw Error("All policy checks failed");
  return {checked};
}
const mod:ServerModule={
  name:"platform-watch",
  http(app) {app.get("/api/site/platform-watch",async()=>{
    const rows=await sql<{platform:string;checked_at:Date;state:Check["state"];evidence:string[];previous_evidence:string[]}[]>`
      SELECT platform,checked_at,state,evidence,previous_evidence FROM market_policy_checks
      WHERE checked_at>=now()-interval '180 days' OR state IN ('baseline','changed') ORDER BY checked_at DESC`;
    const excerpt=(lines:string[])=>lines.slice(0,3).map(line=>line.length>145?line.slice(0,142)+"…":line);
    return rows.map(r=>({platform:r.platform,at:r.checked_at.toISOString(),day:beijingDate(r.checked_at),state:r.state,
      evidence:r.state==="unchanged"?[]:excerpt(r.evidence),prior:excerpt(r.previous_evidence)} satisfies Check));
  })},
  schedules:[{name:"market-policy-check",cron:"35 */6 * * *",run:refreshPolicies,when:()=>process.env.COLLECT_ENABLED==="true"}],
};
export default mod;
