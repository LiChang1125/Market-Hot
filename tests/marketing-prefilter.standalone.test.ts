import assert from "node:assert/strict";
import test from "node:test";
import { awardAnnouncement } from "@aihot/industry/prefilter";

test("recognises prize announcements while keeping reports with measured results", () => {
  assert.equal(awardAnnouncement("WPP Media clients win 16 prizes at M&M Global Awards", "The agency congratulates the teams."), true);
  assert.equal(awardAnnouncement("某品牌斩获三项营销大奖", "项目带来的转化率提高 14%。"), false);
  assert.equal(awardAnnouncement("Why awards judging is changing", "The jury has a new methodology."), false);
});
