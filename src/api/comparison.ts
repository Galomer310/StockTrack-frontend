import { PortfolioResponse, Holding, PublicHolding, isOwnHolding, percent } from "./social";

/* ===========================================================================
   Turns two portfolios into plain-language findings.
   ---------------------------------------------------------------------------
   The tables already show every number; what they do not say is which
   differences actually matter. This derives that: who leads and by how much,
   how concentrated each book is, where the two overlap, and which single
   position is carrying each side.

   Everything here is a ratio. The old version also compared absolute profit
   and capital committed, which is exactly the disclosure the privacy rules
   removed - the server no longer sends the other investor's money, and this
   file no longer asks for it. What is lost is the "who has more capital"
   observation; what is kept is every comparison of skill, which is what the
   ranking is based on anyway.
   =========================================================================== */

export interface Insight {
  label: string;
  text: string;
  tone: "good" | "bad" | "neutral";
}

// Percentage move of one position, whichever shape it arrived in.
const gainOf = (h: Holding): number =>
  isOwnHolding(h)
    ? h.price_at_time > 0
      ? ((h.latest_price - h.price_at_time) / h.price_at_time) * 100
      : 0
    : h.gain_pct;

// Share of the book one position represents, whichever shape it arrived in.
// Your own holdings carry prices, so weights are computed here; someone else's
// arrive pre-computed, because the values they come from never leave the
// server.
const weightsOf = (holdings: Holding[]): { symbol: string; weight: number }[] => {
  if (holdings.length === 0) return [];

  if (isOwnHolding(holdings[0])) {
    const own = holdings.filter(isOwnHolding);
    const total = own.reduce((sum, h) => sum + h.latest_price * h.quantity, 0);
    if (total <= 0) return [];
    const bySymbol: Record<string, number> = {};
    for (const h of own) {
      bySymbol[h.stock_symbol] =
        (bySymbol[h.stock_symbol] || 0) + (h.latest_price * h.quantity * 100) / total;
    }
    return Object.entries(bySymbol).map(([symbol, weight]) => ({ symbol, weight }));
  }

  const bySymbol: Record<string, number> = {};
  for (const h of holdings as PublicHolding[]) {
    bySymbol[h.stock_symbol] = (bySymbol[h.stock_symbol] || 0) + h.weight_pct;
  }
  return Object.entries(bySymbol).map(([symbol, weight]) => ({ symbol, weight }));
};

// Best and worst position by percentage move.
const extremes = (holdings: Holding[]) => {
  if (holdings.length === 0) return { best: null, worst: null };
  const scored = holdings.map((h) => ({ symbol: h.stock_symbol, pct: gainOf(h) }));
  scored.sort((a, b) => b.pct - a.pct);
  return { best: scored[0], worst: scored[scored.length - 1] };
};

// The single largest position as a share of the book.
const concentration = (holdings: Holding[]) => {
  const weights = weightsOf(holdings);
  if (weights.length === 0) return { symbol: "", share: 0 };
  const top = weights.sort((a, b) => b.weight - a.weight)[0];
  return { symbol: top.symbol, share: top.weight };
};

export const buildInsights = (
  mine: PortfolioResponse,
  theirs: PortfolioResponse
): Insight[] => {
  const insights: Insight[] = [];
  const them = theirs.owner.display_name;

  const pctGap = mine.summary.return_pct - theirs.summary.return_pct;

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

  // 2. Breadth. Two books at the same return are not the same bet if one is
  //    spread across twenty names and the other across three.
  if (mine.summary.holdings_count !== theirs.summary.holdings_count) {
    const wider = mine.summary.holdings_count > theirs.summary.holdings_count;
    insights.push({
      label: "Breadth",
      text: wider
        ? `You are spread across ${mine.summary.holdings_count} positions against ${them}'s ${theirs.summary.holdings_count}. A concentrated book moves harder in both directions.`
        : `${them} is spread across ${theirs.summary.holdings_count} positions against your ${mine.summary.holdings_count}. A concentrated book moves harder in both directions.`,
      tone: "neutral",
    });
  }

  // 3. Concentration: a big single-ticker share is the main hidden risk.
  const mineConc = concentration(mine.holdings);
  const theirsConc = concentration(theirs.holdings);
  if (mineConc.symbol && theirsConc.symbol) {
    insights.push({
      label: "Concentration",
      text: `Your largest position is ${mineConc.symbol} at ${mineConc.share.toFixed(0)}% of the book. ${them} sits ${theirsConc.share.toFixed(0)}% in ${theirsConc.symbol}.`,
      tone:
        mineConc.share > 50 && mineConc.share > theirsConc.share ? "bad" : "neutral",
    });
  }

  // 4. Overlap: what is shared versus what is unique to each side.
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

  // 5. Which single position is doing the work on each side.
  const mineExt = extremes(mine.holdings);
  const theirsExt = extremes(theirs.holdings);
  if (mineExt.best && theirsExt.best) {
    insights.push({
      label: "Standouts",
      text: `Your best position is ${mineExt.best.symbol} at ${percent(mineExt.best.pct)}${
        mineExt.worst && mineExt.worst.symbol !== mineExt.best.symbol
          ? `, your weakest ${mineExt.worst.symbol} at ${percent(mineExt.worst.pct)}`
          : ""
      }. Theirs is ${theirsExt.best.symbol} at ${percent(theirsExt.best.pct)}${
        theirsExt.worst && theirsExt.worst.symbol !== theirsExt.best.symbol
          ? `, their weakest ${theirsExt.worst.symbol} at ${percent(theirsExt.worst.pct)}`
          : ""
      }.`,
      tone: "neutral",
    });
  }

  return insights;
};
