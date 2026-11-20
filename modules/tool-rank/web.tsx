import { IconGrid } from "@aihot/web/components/icons";
import type { WebModule } from "@aihot/web/modules";

const entry = { to: "/leaderboard", label: "营销工具榜", icon: IconGrid };
export default {
  name: "tool-rank",
  sidebar: { section: "行业工具", items: [entry] },
  tabs: [{ ...entry, key: "tool-rank", label: "工具榜" }],
} satisfies WebModule;
