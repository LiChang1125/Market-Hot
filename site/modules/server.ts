// The backend of the site's modules, installed by the api and the worker when they start (site/modules/index.ts).
import type { ServerModule } from "@aihot/backend/modules";

import tool_rank from "@aihot/tool-rank/server";
import platform_watch from "@aihot/platform-watch/server";
import tool_offers from "@aihot/tool-offers/server";

export const SERVER_MODULES: readonly ServerModule[] = [tool_rank, platform_watch, tool_offers];
