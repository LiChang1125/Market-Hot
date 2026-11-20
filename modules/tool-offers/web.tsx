import {Link} from "react-router";
import {IconBookmark} from "@aihot/web/components/icons";
import type {WebModule} from "@aihot/web/modules";
const entry={to:"/free-tokens",label:"免费额度与优惠",icon:IconBookmark};
export default {name:"tool-offers",sidebar:{section:"行业工具",items:[entry]},tools:[{...entry,icon:<IconBookmark size={18}/>}],
  account:({place})=><Link className="text-sm text-accent" to="/reader-account">{place==="sidebar"?"读者账号":"读者账号与跨设备同步"}</Link>,
  feedbackGuide:{title:"提报营销工具优惠",lead:"提交官方领取地址、适用地区、额度与截止时间。",example:"工具、官网链接、领取条件……",tips:["请附官方活动或定价页，方便核对。"]},
} satisfies WebModule;
