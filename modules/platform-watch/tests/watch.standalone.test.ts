import {test} from "node:test";
import assert from "node:assert/strict";
import {policies} from "../public.ts";
import {ruleLines} from "../server.ts";
test("policy checks ignore navigation edits and keep the actual quota and unit together",()=>{
  const html='<main><nav><p>Obsolete points per second</p></nav><table><tr><td>Standard</td><td>100 points/second</td></tr></table></main>';
  assert.deepEqual(ruleLines(html,policies.find(p=>p.id==="shopify")!),["Standard · 100 points/second"]);
  assert.deepEqual(ruleLines("<main>Challenge</main>",policies[0]!),[]);
});
