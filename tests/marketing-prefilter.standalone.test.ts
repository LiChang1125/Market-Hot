import assert from "node:assert/strict";
import test from "node:test";
import { awardAnnouncement, measuredAdBusiness } from "@aihot/industry/prefilter";

test("recognises prize announcements while keeping reports with measured results", () => {
  assert.equal(awardAnnouncement("WPP Media clients win 16 prizes at M&M Global Awards", "The agency congratulates the teams."), true);
  assert.equal(awardAnnouncement("某品牌斩获三项营销大奖", "项目带来的转化率提高 14%。"), false);
  assert.equal(awardAnnouncement("Why awards judging is changing", "The jury has a new methodology."), false);
});

test("retains reported ad performance without admitting daily stock prices", () => {
  assert.equal(measuredAdBusiness("Walmart Sees Weakest Global Ad Sales Growth in 2 Years",
    "25%: Year-over-year growth of Walmart’s global advertising business in the third quarter."), true);
  assert.equal(measuredAdBusiness("零售媒体广告收入增速放缓", "本季度广告收入增长25%。"), true);
  assert.equal(measuredAdBusiness("Company stock drops 3%", "Advertising revenue rose 12%."), false);
  assert.equal(measuredAdBusiness("Ad revenue in focus", "The share price rose 12%."), false);
});
