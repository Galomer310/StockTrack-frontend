import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchPortfolio,
  PortfolioResponse,
  money,
  percent,
} from "../api/social";

// Read-only view of one investor's portfolio, reached from the leaderboard.
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

  const { user, summary, holdings, is_self } = data;

  return (
    <div className="investor-page">
      <button className="back-btn" onClick={() => navigate("/leaderboard")}>
        ← Back to leaderboard
      </button>

      <h2>
        {user.display_name}
        {is_self && <span className="lb-you">you</span>}
      </h2>
      <p className="investor-since">
        Investing since {new Date(user.member_since).toLocaleDateString()}
      </p>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-label">Invested</span>
          <span className="summary-value">{money(summary.invested)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Current value</span>
          <span className="summary-value">{money(summary.current_value)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Profit / loss</span>
          <span className={`summary-value ${summary.profit >= 0 ? "gain" : "loss"}`}>
            {money(summary.profit)}
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total return</span>
          <span
            className={`summary-value ${summary.return_pct >= 0 ? "gain" : "loss"}`}
          >
            {percent(summary.return_pct)}
          </span>
        </div>
      </div>

      {!is_self && (
        <button className="compare-btn" onClick={() => navigate(`/compare/${user.id}`)}>
          Compare with my portfolio
        </button>
      )}

      <h3>Holdings</h3>
      {holdings.length === 0 ? (
        <p>This investor has no holdings yet.</p>
      ) : (
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
            {holdings.map((h) => (
              <tr key={h.id}>
                <td>{h.stock_symbol}</td>
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
      )}
    </div>
  );
};

export default InvestorPortfolio;
