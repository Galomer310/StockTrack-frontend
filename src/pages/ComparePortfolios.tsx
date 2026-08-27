import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import {
  fetchPortfolio,
  PortfolioResponse,
  Holding,
  isOwnHolding,
  percent,
} from "../api/social";
import { buildInsights } from "../api/comparison";
import PortfolioComparisonChart from "../components/charts/PortfolioComparisonChart";

/* Side-by-side comparison of your portfolio against another investor's.
   ---------------------------------------------------------------------------
   Both sides come from the same endpoint, but they do NOT arrive in the same
   shape: yours carries prices, theirs carries percentages, because the server
   will not send another investor's money to you. Every row below is therefore
   a ratio - return, weight, position count - which is the only basis on which
   the two can honestly be compared anyway. */
const ComparePortfolios = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Your side of the comparison is whichever portfolio you currently have
  // open, since you may be running three of them.
  const myPortfolioId = useSelector((state: RootState) => state.portfolio.activeId);

  const [mine, setMine] = useState<PortfolioResponse | null>(null);
  const [theirs, setTheirs] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (myPortfolioId === null) {
        setError("Open one of your portfolios first, then come back to compare.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const [a, b] = await Promise.all([
          fetchPortfolio(myPortfolioId),
          fetchPortfolio(Number(id)),
        ]);
        setMine(a);
        setTheirs(b);
      } catch (err: any) {
        setError(
          err.response?.status === 403
            ? "You do not have access to this portfolio."
            : "Could not load the comparison."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, myPortfolioId]);

  // Union of both tickers, so shared and unique positions are both visible.
  //
  // Compared by WEIGHT rather than by value: "18% of the book" is comparable
  // across two portfolios of different sizes, and unlike a dollar figure it
  // discloses nothing about how large either one is.
  const symbolRows = useMemo(() => {
    if (!mine || !theirs) return [];
    const weights = (p: PortfolioResponse) => {
      const map: Record<string, number> = {};
      // Your own holdings carry prices, so weights are derived here. Theirs
      // arrive already expressed as a share of their book.
      const ownTotal = p.holdings
        .filter(isOwnHolding)
        .reduce((sum, h) => sum + h.latest_price * h.quantity, 0);
      for (const h of p.holdings as Holding[]) {
        const weight = isOwnHolding(h)
          ? ownTotal > 0
            ? (h.latest_price * h.quantity * 100) / ownTotal
            : 0
          : h.weight_pct;
        map[h.stock_symbol] = (map[h.stock_symbol] || 0) + weight;
      }
      return map;
    };
    const mineBySymbol = weights(mine);
    const theirsBySymbol = weights(theirs);
    const symbols = Array.from(
      new Set([...Object.keys(mineBySymbol), ...Object.keys(theirsBySymbol)])
    ).sort();
    return symbols.map((symbol) => ({
      symbol,
      mine: mineBySymbol[symbol] || 0,
      theirs: theirsBySymbol[symbol] || 0,
      shared: symbol in mineBySymbol && symbol in theirsBySymbol,
    }));
  }, [mine, theirs]);

  if (loading) return <div className="compare-page"><p>Loading comparison…</p></div>;
  if (error) return <div className="compare-page"><p className="error">{error}</p></div>;
  if (!mine || !theirs) return null;

  // Positive means you are ahead on that measure.
  const diffPct = mine.summary.return_pct - theirs.summary.return_pct;
  const insights = buildInsights(mine, theirs);

  const rows: { label: string; a: string; b: string; winner: "a" | "b" | null }[] = [
    {
      label: "Total return",
      a: percent(mine.summary.return_pct),
      b: percent(theirs.summary.return_pct),
      winner:
        mine.summary.return_pct === theirs.summary.return_pct
          ? null
          : mine.summary.return_pct > theirs.summary.return_pct
          ? "a"
          : "b",
    },
    {
      label: "Holdings",
      a: String(mine.summary.holdings_count),
      b: String(theirs.summary.holdings_count),
      winner: null,
    },
  ];

  return (
    <div className="compare-page">
      <button className="back-btn" onClick={() => navigate("/leaderboard")}>
        ← Back to leaderboard
      </button>

      <h2>
        {mine.portfolio.name} vs {theirs.portfolio.name}
      </h2>
      <p className={`compare-verdict ${diffPct >= 0 ? "gain" : "loss"}`}>
        {diffPct >= 0
          ? `You are ahead by ${Math.abs(diffPct).toFixed(2)} percentage points.`
          : `You are behind by ${Math.abs(diffPct).toFixed(2)} percentage points.`}
      </p>

      {/* Both books on one axis */}
      <h3>Growth side by side</h3>
      <PortfolioComparisonChart mine={mine} theirs={theirs} />

      {/* What the numbers actually mean */}
      <h3>What the difference comes down to</h3>
      <div className="insight-list">
        {insights.map((insight) => (
          <div key={insight.label} className={`insight insight-${insight.tone}`}>
            <span className="insight-label">{insight.label}</span>
            <p>{insight.text}</p>
          </div>
        ))}
      </div>

      <h3>Head to head</h3>
      <div className="table-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th></th>
            <th>{mine.portfolio.name}</th>
            <th>{theirs.portfolio.name}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="compare-label">{r.label}</td>
              <td className={r.winner === "a" ? "compare-winner" : ""}>{r.a}</td>
              <td className={r.winner === "b" ? "compare-winner" : ""}>{r.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <h3>Positions by ticker</h3>
      <p className="compare-note">
        How much of each book sits in each ticker, as a share of the whole.
      </p>
      <div className="table-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th>Ticker</th>
            <th>{mine.portfolio.name}</th>
            <th>{theirs.portfolio.name}</th>
          </tr>
        </thead>
        <tbody>
          {symbolRows.map((row) => (
            <tr key={row.symbol} className={row.shared ? "compare-shared" : ""}>
              <td className="compare-label">
                <Link className="ticker-link" to={`/stock/${row.symbol}`}>
                  {row.symbol}
                </Link>
                {row.shared && <span className="compare-badge">both</span>}
              </td>
              <td>{row.mine ? `${row.mine.toFixed(1)}%` : "—"}</td>
              <td>{row.theirs ? `${row.theirs.toFixed(1)}%` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {symbolRows.length === 0 && <p>Neither portfolio has any positions yet.</p>}
    </div>
  );
};

export default ComparePortfolios;
