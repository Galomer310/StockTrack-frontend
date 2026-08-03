import { PortfolioResponse, Holding, money, percent } from "./social";

/* ===========================================================================
   Turns two portfolios into plain-language findings.
   ---------------------------------------------------------------------------
   The tables already show every number; what they do not say is which
   differences actually matter. This derives that: who leads and by how much,
   whether the lead comes from stock picking or from committing more capital,
   how concentrated each book is, and where the two overlap.
   =========================================================================== */

export interface Insight {
  label: string;
  text: string;
  tone: "good" | "bad" | "neutral";
}

// Total current value of a holdings list.
const valueOf = (holdings: Holding[]) =>
  holdings.reduce((sum, h) => sum + h.latest_price * h.quantity, 0);

// Best and worst position by percentage move.
const extremes = (holdings: Holding[]) => {
  if (holdings.length === 0) return { best: null, worst: null };
  const scored = holdings.map((h) => ({
    symbol: h.stock_symbol,
    pct:
      h.price_at_time > 0
        ? ((h.latest_price - h.price_at_time) / h.price_at_time) * 100
        : 0,
  }));
  scored.sort((a, b) => b.pct - a.pct);
  return { best: scored[0], worst: scored[scored.length - 1] };
};

// Share of the portfolio sitting in its single largest ticker.
const concentration = (holdings: Holding[]) => {
  const total = valueOf(holdings);
  if (total <= 0) return { symbol: "", share: 0 };
  const bySymbol: Record<string, number> = {};
  for (const h of holdings) {
    bySymbol[h.stock_symbol] =
      (bySymbol[h.stock_symbol] || 0) + h.latest_price * h.quantity;
  }
  const [symbol, amount] = Object.entries(bySymbol).sort((a, b) => b[1] - a[1])[0];
  return { symbol, share: (amount / total) * 100 };
};

export const buildInsights = (
  mine: PortfolioResponse,
  theirs: PortfolioResponse
): Insight[] => {
  const insights: Insight[] = [];
  const you = mine.user.display_name;
  const them = theirs.user.display_name;

  const pctGap = mine.summary.return_pct - theirs.summary.return_pct;
  const profitGap = mine.summary.profit - theirs.summary.profit;
  const investedGap = mine.summary.invested - theirs.summary.invested;

  // 1. The headline: who is ahead on return, and by how much.
  if (Math.abs(pctGap) < 0.01) {
    insights.push({
      label: "Return",
      text: `You and ${them} are level at ${percent(mine.summary.return_pct)}.`,
      tone: "neutral",
    });
  } else {
    insights.push({
      label: "Return",
      text:
        pctGap > 0
          ? `You are ahead on return: ${percent(mine.summary.return_pct)} against ${percent(theirs.summary.return_pct)}, a gap of ${Math.abs(pctGap).toFixed(2)} percentage points.`
          : `${them} is ahead on return: ${percent(theirs.summary.return_pct)} against your ${percent(mine.summary.return_pct)}, a gap of ${Math.abs(pctGap).toFixed(2)} percentage points.`,
      tone: pctGap > 0 ? "good" : "bad",
    });
  }

  // 2. The interesting case: percentage and absolute profit disagree, which
  //    means the lead is coming from capital rather than from picking.
  const pctLeaderIsMine = pctGap > 0;
  const profitLeaderIsMine = profitGap > 0;
  if (Math.abs(pctGap) > 0.01 && Math.abs(profitGap) > 0.01 && pctLeaderIsMine !== profitLeaderIsMine) {
    const pctLeader = pctLeaderIsMine ? you : them;
    const profitLeader = profitLeaderIsMine ? you : them;
    insights.push({
      label: "Why",
      text: `${profitLeader} has made more money in absolute terms (${money(Math.abs(profitGap))} more), but ${pctLeader} has the better return. The difference is capital committed, not stock picking.`,
      tone: "neutral",
    });
  } else {
    insights.push({
      label: "Profit",
      text:
        profitGap > 0
          ? `You are up ${money(mine.summary.profit)} against ${money(theirs.summary.profit)} — ${money(Math.abs(profitGap))} more.`
          : `${them} is up ${money(theirs.summary.profit)} against your ${money(mine.summary.profit)} — ${money(Math.abs(profitGap))} more.`,
      tone: profitGap > 0 ? "good" : "bad",
    });
  }

  // 3. Capital committed.
  if (Math.abs(investedGap) > 0.01) {
    insights.push({
      label: "Capital",
      text:
        investedGap > 0
          ? `You have committed ${money(Math.abs(investedGap))} more capital (${money(mine.summary.invested)} against ${money(theirs.summary.invested)}).`
          : `${them} has committed ${money(Math.abs(investedGap))} more capital (${money(theirs.summary.invested)} against ${money(mine.summary.invested)}).`,
      tone: "neutral",
    });
  }

  // 4. Concentration: a big single-ticker share is the main hidden risk.
  const mineConc = concentration(mine.holdings);
  const theirsConc = concentration(theirs.holdings);
  if (mineConc.symbol && theirsConc.symbol) {
    insights.push({
      label: "Concentration",
      text: `Your largest position is ${mineConc.symbol} at ${mineConc.share.toFixed(0)}% of the book, across ${mine.summary.holdings_count} holdings. ${them} sits ${theirsConc.share.toFixed(0)}% in ${theirsConc.symbol} across ${theirs.summary.holdings_count}.`,
      tone:
        mineConc.share > 50 && mineConc.share > theirsConc.share ? "bad" : "neutral",
    });
  }

  // 5. Overlap: what is shared versus what is unique to each side.
  const mineSymbols = new Set(mine.holdings.map((h) => h.stock_symbol));
  const theirsSymbols = new Set(theirs.holdings.map((h) => h.stock_symbol));
  const shared = [...mineSymbols].filter((s) => theirsSymbols.has(s));
  const onlyTheirs = [...theirsSymbols].filter((s) => !mineSymbols.has(s));

  if (shared.length > 0 || onlyTheirs.length > 0) {
    const parts: string[] = [];
    if (shared.length > 0) parts.push(`You both hold ${shared.sort().join(", ")}.`);
    if (onlyTheirs.length > 0)
      parts.push(
        `${them} holds ${onlyTheirs.sort().join(", ")}, which you do not.`
      );
    insights.push({ label: "Overlap", text: parts.join(" "), tone: "neutral" });
  }

  // 6. Which single position is doing the work on each side.
  const mineExt = extremes(mine.holdings);
  const theirsExt = extremes(theirs.holdings);
  if (mineExt.best && theirsExt.best) {
    insights.push({
      label: "Standouts",
      text: `Your best position is ${mineExt.best.symbol} at ${percent(mineExt.best.pct)}${
        mineExt.worst && mineExt.worst.symbol !== mineExt.best.symbol
          ? `, your weakest ${mineExt.worst.symbol} at ${percent(mineExt.worst.pct)}`
          : ""
      }. Theirs is ${theirsExt.best.symbol} at ${percent(theirsExt.best.pct)}.`,
      tone: "neutral",
    });
  }

  return insights;
};
