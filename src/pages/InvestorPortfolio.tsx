import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import TradeJournal from "../components/trades/TradeJournal";
import {
  fetchPortfolio,
  PortfolioResponse,
  OwnHolding,
  PublicHolding,
  isOwnHolding,
  money,
  percent,
} from "../api/social";

/* ===========================================================================
   Read-only view of one investor's portfolio, reached from the leaderboard.
   ---------------------------------------------------------------------------
   Viewing someone else, you get one figure: total return, as a percentage.
   No capital deployed, no current value, no profit or loss - the server does
   not send them. Per position you get how it has done and how big a share of
   the book it is, and below that the full log of buys and sells with the date
   and time of each.

   Opening your OWN id (the dashboard links here) still shows everything,
   because at that point you are looking at your own numbers.
   =========================================================================== */
const InvestorPortfolio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        setData(await fetchPortfolio(Number(id)));
      } catch (err: any) {
        // 403 is what the future paid-tier gate will return.
        setError(
          err.response?.status === 403
            ? "You do not have access to this portfolio."
            : "Could not load this portfolio."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="investor-page"><p>Loading portfolio…</p></div>;
  if (error) return <div className="investor-page"><p className="error">{error}</p></div>;
  if (!data) return null;

  const { portfolio, owner, summary, holdings, is_self } = data;

  return (
    <div className="investor-page">
      <button className="back-btn" onClick={() => navigate("/leaderboard")}>
        ← Back to leaderboard
      </button>

      <h2>
        {portfolio.name}
        {is_self && <span className="lb-you">you</span>}
      </h2>
      <p className="investor-since">
        {owner.display_name} · opened{" "}
        {new Date(portfolio.created_at).toLocaleDateString()}
      </p>

      <div className="summary-cards">
        {/* Total return is the whole story for a visitor. */}
        <div className="summary-card">
          <span className="summary-label">Total return</span>
          <span
            className={`summary-value ${summary.return_pct >= 0 ? "gain" : "loss"}`}
          >
            {percent(summary.return_pct)}
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Holdings</span>
          <span className="summary-value">{summary.holdings_count}</span>
        </div>
        {/* A ratio, so everyone sees it: how much of the book is uninvested
            says as much about the strategy as the return does. */}
        <div className="summary-card">
          <span className="summary-label">In cash</span>
          <span className="summary-value">{summary.cash_weight_pct.toFixed(1)}%</span>
        </div>

        {/* Your own figures, which nobody else receives. */}
        {is_self && summary.equity !== undefined && (
          <>
            <div className="summary-card">
              <span className="summary-label">Equity</span>
              <span className="summary-value">{money(summary.equity)}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Cash</span>
              <span className="summary-value">{money(summary.cash ?? 0)}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Opened with</span>
              <span className="summary-value">{money(summary.starting_balance ?? 0)}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Profit / loss</span>
              <span
                className={`summary-value ${(summary.profit ?? 0) >= 0 ? "gain" : "loss"}`}
              >
                {money(summary.profit ?? 0)}
              </span>
            </div>
          </>
        )}
      </div>

      {!is_self && (
        <>
          <p className="privacy-note">
            You are seeing {owner.display_name}'s results as percentages. What
            they paid, what they hold and what it is worth stay private.
          </p>
          <button
            className="compare-btn"
            onClick={() => navigate(`/compare/${portfolio.id}`)}
          >
            Compare with my portfolio
          </button>
        </>
      )}

      <h3>Trade journal</h3>
      <p className="compare-note">
        Every buy and sell {is_self ? "you have" : `${owner.display_name} has`} recorded
        in this portfolio, with the date and time it was taken and the reasoning
        at the time.
      </p>
      <TradeJournal portfolioId={portfolio.id} />

      <h3>Holdings</h3>
      {holdings.length === 0 ? (
        <p>This investor has no holdings yet.</p>
      ) : is_self ? (
        /* Your own book, in full. */
        <div className="table-wrap">
          <table className="holdings-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Bought at</th>
                <th>Latest</th>
                <th>Qty</th>
                <th>Added</th>
                <th>Profit / loss</th>
              </tr>
            </thead>
            <tbody>
              {(holdings as OwnHolding[]).filter(isOwnHolding).map((h) => (
                <tr key={h.id}>
                  <td>
                    <Link className="ticker-link" to={`/stock/${h.stock_symbol}`}>
                      {h.stock_symbol}
                    </Link>
                  </td>
                  <td>{money(h.price_at_time)}</td>
                  <td>{money(h.latest_price)}</td>
                  <td>{h.quantity}</td>
                  <td>{new Date(h.added_at).toLocaleDateString()}</td>
                  <td className={h.profit_loss >= 0 ? "gain" : "loss"}>
                    {money(h.profit_loss)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Someone else's book: which tickers, how each has done, and how much
           of the portfolio each represents. Weight replaces quantity - it says
           how committed they are without disclosing the size of the position. */
        <div className="table-wrap">
          <table className="holdings-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Held since</th>
                <th>Share of portfolio</th>
                <th>Return</th>
              </tr>
            </thead>
            <tbody>
              {(holdings as PublicHolding[]).map((h) => (
                <tr key={h.id}>
                  <td>
                    <Link className="ticker-link" to={`/stock/${h.stock_symbol}`}>
                      {h.stock_symbol}
                    </Link>
                  </td>
                  <td>{new Date(h.added_at).toLocaleDateString()}</td>
                  <td>
                    <span className="weight-bar" aria-hidden="true">
                      <span
                        className="weight-bar-fill"
                        style={{ width: `${Math.min(h.weight_pct, 100)}%` }}
                      />
                    </span>
                    {h.weight_pct.toFixed(1)}%
                  </td>
                  <td className={h.gain_pct >= 0 ? "gain" : "loss"}>
                    {percent(h.gain_pct)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvestorPortfolio;
