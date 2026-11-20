import { IconClock } from "@aihot/web/components/icons";
import type { WebModule } from "@aihot/web/modules";
const entry={to:"/resets",label:"平台额度与政策",icon:IconClock};
export default {name:"platform-watch",sidebar:{section:"行业工具",items:[entry]},tools:[{...entry,icon:<IconClock size={18}/>}]} satisfies WebModule;
