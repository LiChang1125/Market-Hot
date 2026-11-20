import {createHash,randomBytes,randomUUID} from "node:crypto";
import {z} from "zod";
import {sql} from "@aihot/backend/db";
import type {ServerModule} from "@aihot/backend/modules";
import type {FastifyRequest,FastifyReply} from "fastify";
import {products} from "../tool-rank/public.ts";

const hash=(s:string)=>createHash("sha256").update(s).digest("hex");
const secret=()=>randomBytes(32).toString("base64url");
const cookie="market_reader";
const attempts = new Map<string, {count:number; expires:number}>();
function allowAccountRequest(req:FastifyRequest, path:string){
  const now=Date.now();
  const key=path+" "+String(req.headers["x-real-ip"] || req.ip);
  const current=attempts.get(key);
  if(current && current.expires>now) return ++current.count <= (path==="/create"?5:30);
  for(const [k,record] of attempts) if(record.expires<=now) attempts.delete(k);
  if(attempts.size>=10000)return false;
  attempts.set(key,{count:1,expires:now+3600000});
  return true;
}
const token=(req:FastifyRequest)=>req.headers.cookie?.split(";").map(v=>v.trim()).find(v=>v.startsWith(cookie+"="))?.slice(cookie.length+1);
async function owner(req:FastifyRequest) {
  const t=token(req);
  if(!t || !/^[\w-]{43}$/.test(t)) return null;
  const [row]=await sql<{owner:string}[]>`SELECT owner FROM market_reader_sessions WHERE token_hash=${hash(t)} AND expires_at>now()`;
  return row?.owner || null;
}
async function login(reply:FastifyReply,id:string){
  const t=secret();
  await sql`INSERT INTO market_reader_sessions(token_hash,owner,expires_at) VALUES(${hash(t)},${id},now()+interval '30 days')`;
  reply.header("Set-Cookie",cookie+"="+t+"; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000"+(process.env.SITE_URL?.startsWith("https://")?"; Secure":""));
}
const star=z.object({id:z.string().min(1).max(100),title:z.string().max(400),summary:z.string().max(3000).nullable(),sourceName:z.string().max(180),
  savedAt:z.iso.datetime(),publishedAt:z.string().max(45).nullable(),score:z.number().nullable(),aiSelected:z.boolean()});
const entry=z.discriminatedUnion("kind",[
  z.object({kind:z.literal("claim"),key:z.string().max(140),value:z.object({slug:z.string(),plan:z.string().max(80),at:z.iso.datetime()}).nullable()}),
  z.object({kind:z.literal("star"),key:z.string().min(1).max(100),value:star.nullable()}),
]);
function sameSite(req:FastifyRequest,reply:FastifyReply){
  if(req.headers.origin!==new URL(process.env.SITE_URL||"http://localhost:3000").origin || !req.headers["content-type"]?.startsWith("application/json")){
    return reply.code(403).send({error:"origin"});
  }
}
const module:ServerModule={
  name:"tool-offers",
  http(app){
    app.register(async api=>{
      api.addHook("onRequest",async(req,reply)=>{
        reply.header("Cache-Control","private, no-store");
        if(req.method!=="GET") return sameSite(req,reply);
      });
      api.post("/create",async(req,reply)=>{
        if(!allowAccountRequest(req,"/create"))return reply.code(429).send({error:"rate_limit"});
        const code=secret(),id=randomUUID();
        await sql`INSERT INTO market_reader_accounts(id,login_hash) VALUES(${id},${hash(code)})`;
        await login(reply,id); return {code};
      });
      api.post("/login",async(req,reply)=>{
        if(!allowAccountRequest(req,"/login"))return reply.code(429).send({error:"rate_limit"});
        const body=z.object({code:z.string().regex(/^[\w-]{43}$/)}).safeParse(req.body);
        if(!body.success) return reply.code(401).send({error:"code"});
        const [row]=await sql<{id:string}[]>`SELECT id FROM market_reader_accounts WHERE login_hash=${hash(body.data.code)}`;
        if(!row) return reply.code(401).send({error:"code"});
        await login(reply,row.id);return {ok:true};
      });
      api.post("/logout",async(req,reply)=>{
        const t=token(req);
        if(t) await sql`DELETE FROM market_reader_sessions WHERE token_hash=${hash(t)}`;
        reply.header("Set-Cookie",cookie+"=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0");return {ok:true};
      });
      api.get("/",async(req)=>{
        const id=await owner(req);
        if(!id) return {signedIn:false,entries:[]};
        const entries=await sql`SELECT kind,entry_key AS key,value FROM market_reader_entries WHERE owner=${id} ORDER BY entry_key`;
        return {signedIn:true,entries};
      });
      api.post("/entries",async(req,reply)=>{
        const id=await owner(req);if(!id) return reply.code(401).send({error:"login"});
        const parsed=z.array(entry).max(200).safeParse(req.body);if(!parsed.success) return reply.code(400).send({error:"entries"});
        for(const e of parsed.data) {
          if(e.value && ((e.kind==="star" && e.key!==e.value.id) || (e.kind==="claim" &&
            (!products.some(t=>t.slug===e.value!.slug) || e.key!==e.value.slug+"/"+e.value.plan)))) return reply.code(400).send({error:"key"});
        }
        await sql.begin(async tx=>{
          for(const e of parsed.data){
            if(!e.value){await tx`DELETE FROM market_reader_entries WHERE owner=${id} AND kind=${e.kind} AND entry_key=${e.key}`;continue}
            await tx`INSERT INTO market_reader_entries(owner,kind,entry_key,value) VALUES(${id},${e.kind},${e.key},${tx.json(e.value)})
             ON CONFLICT(owner,kind,entry_key) DO UPDATE SET value=excluded.value`;
          }
        });return {ok:true};
      });
    },{prefix:"/api/market-account"});
  },
  schedules:[{name:"market-session-cleanup",cron:"22 3 * * *",run:async()=>{await sql`DELETE FROM market_reader_sessions WHERE expires_at<=now()`;}}],
};export default module;
