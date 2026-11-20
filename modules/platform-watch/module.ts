import { defineModule } from "@aihot/contracts/modules";
export default defineModule({
  name:"platform-watch",
  apiPaths:[/^\/api\/site\/platform-watch$/],
  pages:[{path:"resets",file:"web/watch.tsx"},{path:"resets/:platform",file:"web/watch.tsx",id:"market-watch-platform"},
    {path:"resets/:platform/history/:day",file:"web/watch.tsx",id:"market-watch-day"}],
});
