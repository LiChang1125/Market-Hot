// The modules this site runs (modules/<name>/, see docs/architecture.md). A module has a line in each list
// it has an entry for: here for its addresses (module.ts), in server.ts for its backend, in web.ts for its
// pages' parts. Each list keeps the order its entries appear in on the site.
import type { ModuleDeclaration } from "@aihot/contracts/modules";

import tool_rank from "@aihot/tool-rank/module";
import platform_watch from "@aihot/platform-watch/module";
import tool_offers from "@aihot/tool-offers/module";

export const MODULES: readonly ModuleDeclaration[] = [tool_rank, platform_watch, tool_offers];
