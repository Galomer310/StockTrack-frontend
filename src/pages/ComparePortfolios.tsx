import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import {
  fetchPortfolio,
  PortfolioResponse,
  money,
  percent,
} from "../api/social";
import { buildInsights } from "../api/comparison";
import PortfolioComparisonChart from "../components/charts/PortfolioComparisonChart";

// Side-by-side comparison of your portfolio against another investor's.
// Both sides come from the same endpoint so the two columns are always
// computed identically.
const ComparePortfolios = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const me = useSelector((state: RootState) => state.auth.user);

  const [mine, setMine] = useState<PortfolioResponse | null>(null);
  const [theirs, setTheirs] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!me) return;
      setLoading(true);
      setError("");
      try {
        const [a, b] = await Promise.all([
          fetchPortfolio(me.id),
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
  }, [id, me]);

  // Union of both tickers, so shared and unique positions are both visible.
  const symbolRows = useMemo(() => {
    if (!mine || !theirs) return [];
    const totals = (p: PortfolioResponse) => {
      const map: Record<string, number> = {};
      for (const h of p.holdings) {
        map[h.stock_symbol] = (map[h.stock_symbol] || 0) + h.latest_price * h.quantity;
      }
      return map;
    };
    const mineBySymbol = totals(mine);
    const theirsBySymbol = totals(theirs);
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
      label: "Profit / loss",
      a: money(mine.summary.profit),
      b: money(theirs.summary.profit),
      winner:
        mine.summary.profit === theirs.summary.profit
          ? null
          : mine.summary.profit > theirs.summary.profit
          ? "a"
          : "b",
    },
    {
      label: "Invested",
      a: money(mine.summary.invested),
      b: money(theirs.summary.invested),
      winner: null,
    },
    {
      label: "Current value",
      a: money(mine.summary.current_value),
      b: money(theirs.summary.current_value),
      winner: null,
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
        {mine.user.display_name} vs {theirs.user.display_name}
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
            <th>{mine.user.display_name}</th>
            <th>{theirs.user.display_name}</th>
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
      <p className="compare-note">Current market value held in each ticker.</p>
      <div className="table-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th>Ticker</th>
            <th>{mine.user.display_name}</th>
            <th>{theirs.user.display_name}</th>
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
              <td>{row.mine ? money(row.mine) : "—"}</td>
              <td>{row.theirs ? money(row.theirs) : "—"}</td>
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
