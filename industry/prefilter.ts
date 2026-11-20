/** Headlines announcing an award to the sender or its clients. A separate reported business outcome
 * keeps the article in the normal editorial process. */
export function awardAnnouncement(title: string, body: string): boolean {
  const announcement = /\b(?:wins?|won|takes? home|scoops?|picks? up)\b.{0,65}\b(?:awards?|prizes?|lions?)\b/i.test(title)
    || /(?:荣获|斩获|揽获|捧回).{0,24}(?:奖|金狮|银狮)/u.test(title);
  if (!announcement) return false;
  const measuredOutcome = /(?:revenue|sales|conversion|return on ad spend|market share|营收|销售额|转化率|广告支出回报|市场份额).{0,45}\d[\d.,]*\s*(?:%|％|个百分点|million|billion|万元|亿元)/i;
  return !measuredOutcome.test(title + "\n" + body);
}
