import {defineModule} from "@aihot/contracts/modules";
export default defineModule({name:"tool-offers",apiPaths:[/^\/api\/market-account(?:\/|$)/],pages:[
  {path:"free-tokens",file:"web/offers.tsx"},
  {path:"free-tokens/album",file:"web/offers.tsx",id:"marketing-offer-album"},
  {path:"reader-account",file:"web/account.tsx"},
]});
