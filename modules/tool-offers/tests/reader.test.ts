import {test} from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import mod from "../server.ts";
test("reader claims require a same-origin request and remain private to the logged-in reader",async()=>{
  const app=Fastify();
  mod.http!(app);
  try{
    const origin=new URL(process.env.SITE_URL||"http://localhost:3000").origin;
    const path="/api/market-account/";
    const post=(endpoint:string,body:unknown,cookie="",source=origin)=>app.inject({method:"POST",url:path+endpoint,
      headers:{origin:source,"content-type":"application/json",cookie},payload:JSON.stringify(body)});
    assert.equal((await post("create",{},"","https://other.invalid")).statusCode,403);
    const created=await post("create",{});
    assert.equal(created.statusCode,200);
    const cookie=String(created.headers["set-cookie"]).split(";")[0]!;
    const entry={kind:"claim",key:"omnisend/FREE",value:{slug:"omnisend",plan:"FREE",at:new Date().toISOString()}};
    assert.equal((await post("entries",[entry])).statusCode,401);
    assert.equal((await post("entries",[entry],cookie)).statusCode,200);
    const other=await post("create",{});
    const separate=await app.inject({method:"GET",url:path,headers:{cookie:String(other.headers["set-cookie"]).split(";")[0]!}});
    assert.deepEqual(separate.json().entries,[]);
    const login=await post("login",{code:created.json().code});
    const restored=await app.inject({method:"GET",url:path,headers:{cookie:String(login.headers["set-cookie"]).split(";")[0]!}});
    assert.deepEqual(restored.json().entries,[entry]);
    await post("logout",{},cookie);
    assert.equal((await app.inject({method:"GET",url:path,headers:{cookie}})).json().signedIn,false);
  }finally{await app.close()}
});
