import { defineModule } from "@aihot/contracts/modules";

export default defineModule({
  name: "tool-rank",
  apiPaths: [/^\/api\/site\/marketing-tools(?:\/|$)/],
  pages: [
    { path: "leaderboard", file: "web/ranking.tsx" },
    { path: "leaderboard/category/:category", file: "web/ranking.tsx", id: "marketing-tool-category" },
    { path: "leaderboard/prices", file: "web/ranking.tsx", id: "marketing-tool-prices" },
    { path: "leaderboard/rules", file: "web/reference.tsx" },
    { path: "leaderboard/sources", file: "web/reference.tsx", id: "marketing-tool-sources" },
    { path: "leaderboard/:slug", file: "web/detail.tsx" },
  ],
});
