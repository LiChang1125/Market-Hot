/** Headlines announcing an award to the sender or its clients. A separate reported business outcome
 * keeps the article in the normal editorial process. */
export function awardAnnouncement(title: string, body: string): boolean {
  const announcement = /\b(?:wins?|won|takes? home|scoops?|picks? up)\b.{0,65}\b(?:awards?|prizes?|lions?)\b/i.test(title)
    || /(?:荣获|斩获|揽获|捧回).{0,24}(?:奖|金狮|银狮)/u.test(title);
  if (!announcement) return false;
  const measuredOutcome = /(?:revenue|sales|conversion|return on ad spend|market share|营收|销售额|转化率|广告支出回报|市场份额).{0,45}\d[\d.,]*\s*(?:%|％|个百分点|million|billion|万元|亿元)/i;
  return !measuredOutcome.test(title + "\n" + body);
}

/** A quantified change in an advertising business is in scope even inside quarterly financial reporting. */
export function measuredAdBusiness(title: string, body: string): boolean {
  const metric = /\b(?:ad|advertising|media)\s+(?:sales|revenue|spend|spending|budget|investment)\b|广告(?:业务|销售|收入|营收|支出|预算)/i;
  if (!metric.test(title)) return false;
  return body.split(/[。！？\n]|(?<=[a-z%])\.\s+/i).some(sentence =>
    /\d(?:[\d,.]*\d)?\s*(?:%|％|个百分点)/.test(sentence) &&
    (metric.test(sentence) || /\badvertising (?:business|growth)\b/i.test(sentence)));
}
