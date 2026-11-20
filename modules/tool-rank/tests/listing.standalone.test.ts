import {test} from "node:test";
import assert from "node:assert/strict";
import {parseListing} from "../server.ts";

test("ranking parses review counts and keeps free installation distinct from a free subscription",()=>{
  const row=parseListing('<h1>Marketing tool</h1><script type="application/ld+json">{"@type":"SoftwareApplication","aggregateRating":{"ratingValue":"4.8","ratingCount":71}}</script><div class="app-details-pricing-plan-card"><p data-test-id="name">Starter</p><h3 aria-label="Free to install"></h3><ul><li>Subscription required</li></ul></div>');
  assert.equal(row.rating,4.8);
  assert.equal(row.reviews,71);
  assert.deepEqual(row.plans,[{name:"Starter",price:"Free to install",features:["Subscription required"]}]);
  assert.throws(()=>parseListing('<h1>Access denied</h1>'));
});
