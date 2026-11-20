// What the site's modules add to the web pages (site/modules/index.ts).
import type { WebModule } from "@aihot/web/modules";

import tool_rank from "@aihot/tool-rank/web";
import platform_watch from "@aihot/platform-watch/web";
import tool_offers from "@aihot/tool-offers/web";

export const WEB_MODULES: readonly WebModule[] = [tool_rank, platform_watch, tool_offers];
