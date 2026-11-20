import { Link, useLocation } from "react-router";
import { products, sourceUrl } from "@aihot/site/marketing-tools";
import { ToolPage } from "@aihot/site/brand/ToolPage.tsx";
export const handle = {tab:"tool-rank",name:"工具榜说明"};
export const meta = () => [{title:"营销工具榜来源与规则 · Market Hot"}];
export default function Reference(){
  const sources=useLocation().pathname.endsWith("/sources");
  return <ToolPage title={sources?"数据来源":"排名怎么算"} back={{to:"/leaderboard",label:"营销工具榜"}}>
    {sources ? <><p>每项记录均取自该工具在 Shopify 应用市场的公开页面。可从这里核对价格、商家评分和评论数。</p>
      <ul>{products.map(p=><li key={p.slug}><a className="market-action" href={sourceUrl(p.slug)}>{p.name} ↗</a></li>)}</ul></> :
      <><h2>排名依据</h2><p>综合榜和分类榜按 Shopify 公布的商家评分从高到低排列。同分时，评论较多的工具排在前面。点击评论数表头可切换排序。</p>
      <h2>覆盖范围</h2><p>榜单跟踪可从同一应用市场核对数据的营销工具。评分反映该市场商家使用应用的体验。广告投放回报、全球市场份额和其他平台的口碑需要另查数据。</p>
      <h2>价格和更新</h2><p>后台每六小时核对一次，按北京时间记录每日观测值。采集失败会保留上次成功的数值及其日期。免费安装的工具可能另收服务费或广告费，具体条件见来源。</p>
      <Link className="market-action" to="/leaderboard/sources">核对全部来源</Link></>}
  </ToolPage>;
}
