import { PortfolioResponse, Holding, PublicHolding, isOwnHolding, percent } from "./social";
import { fill } from "../i18n/fill";
import { MessageKey } from "../i18n/messages";

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

// `t` gives the reader's language; `iso` keeps names, tickers and figures in
// their own direction inside a Hebrew sentence (identity in English).
export const buildInsights = (
  mine: PortfolioResponse,
  theirs: PortfolioResponse,
  t: (key: MessageKey) => string,
  iso: (value: string) => string = (v) => v
): Insight[] => {
  const insights: Insight[] = [];
  const them = iso(theirs.owner.display_name);
  const pct = (n: number) => iso(percent(n));

  const pctGap = mine.summary.return_pct - theirs.summary.return_pct;
  const gap = iso(Math.abs(pctGap).toFixed(2));

  // 1. The headline: who is ahead on return, and by how much.
  if (Math.abs(pctGap) < 0.01) {
    insights.push({
      label: t("ins_return"),
      text: fill(t("ins_level"), { them, pct: pct(mine.summary.return_pct) }),
      tone: "neutral",
    });
  } else {
    insights.push({
      label: t("ins_return"),
      text: fill(t(pctGap > 0 ? "ins_ahead" : "ins_behind"), {
        them,
        mine: pct(mine.summary.return_pct),
        theirs: pct(theirs.summary.return_pct),
        gap,
      }),
      tone: pctGap > 0 ? "good" : "bad",
    });
  }

  // 2. Breadth. Two books at the same return are not the same bet if one is
  //    spread across twenty names and the other across three.
  if (mine.summary.holdings_count !== theirs.summary.holdings_count) {
    const wider = mine.summary.holdings_count > theirs.summary.holdings_count;
    insights.push({
      label: t("ins_breadth"),
      text: fill(t(wider ? "ins_wider" : "ins_narrower"), {
        them,
        mine: mine.summary.holdings_count,
        theirs: theirs.summary.holdings_count,
      }),
      tone: "neutral",
    });
  }

  // 3. Concentration: a big single-ticker share is the main hidden risk.
  const mineConc = concentration(mine.holdings);
  const theirsConc = concentration(theirs.holdings);
  if (mineConc.symbol && theirsConc.symbol) {
    insights.push({
      label: t("ins_concentration"),
      text: fill(t("ins_conc"), {
        them,
        mine_symbol: iso(mineConc.symbol),
        mine_share: mineConc.share.toFixed(0),
        theirs_symbol: iso(theirsConc.symbol),
        theirs_share: theirsConc.share.toFixed(0),
      }),
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
    if (shared.length > 0) parts.push(fill(t("ins_both_hold"), { list: iso(shared.sort().join(", ")) }));
    if (onlyTheirs.length > 0)
      parts.push(fill(t("ins_only_theirs"), { them, list: iso(onlyTheirs.sort().join(", ")) }));
    insights.push({ label: t("ins_overlap"), text: parts.join(" "), tone: "neutral" });
  }

  // 5. Which single position is doing the work on each side.
  const mineExt = extremes(mine.holdings);
  const theirsExt = extremes(theirs.holdings);
  if (mineExt.best && theirsExt.best) {
    const at = (key: MessageKey, p: { symbol: string; pct: number }) =>
      fill(t(key), { symbol: iso(p.symbol), pct: pct(p.pct) });
    insights.push({
      label: t("ins_standouts"),
      text:
        at("ins_best_mine", mineExt.best) +
        (mineExt.worst && mineExt.worst.symbol !== mineExt.best.symbol ? at("ins_worst_mine", mineExt.worst) : "") +
        at("ins_best_theirs", theirsExt.best) +
        (theirsExt.worst && theirsExt.worst.symbol !== theirsExt.best.symbol
          ? at("ins_worst_theirs", theirsExt.worst)
          : "") +
        ".",
      tone: "neutral",
    });
  }

  return insights;
};
