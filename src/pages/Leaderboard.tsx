import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchLeaderboard,
  LeaderboardEntry,
  percent,
} from "../api/social";

// Ranks every portfolio by percentage return since it was opened, so a
// cautious book can out-rank a large one on skill rather than capital.
//
// The unit is the portfolio, not the account: a user runs up to three and each
// is ranked on its own, which is what makes an experimental book safe to try.
//
// Percentages only, including your own rows: portfolio values are nobody's
// business here, and every book starts from the same $10,000 anyway, so the
// percentages are directly comparable.
const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setEntries(await fetchLeaderboard());
      } catch (err) {
        setError("Could not load the leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="leaderboard-page"><p>Loading leaderboard…</p></div>;
  if (error) return <div className="leaderboard-page"><p className="error">{error}</p></div>;

  return (
    <div className="leaderboard-page">
      <h2>Leaderboard</h2>
      <p className="leaderboard-subtitle">
        Every portfolio ranked by return since it opened. Each starts with the
        same $10,000, so these are comparable.
      </p>

      <div className="leaderboard-table">
        <div className="leaderboard-row leaderboard-head">
          <div className="lb-rank">#</div>
          <div className="lb-name">Portfolio</div>
          <div className="lb-holdings">Holdings</div>
          <div className="lb-return">Return</div>
          <div className="lb-actions"></div>
        </div>

        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`leaderboard-row${entry.is_mine ? " is-me" : ""}`}
          >
            <div className="lb-rank">{entry.rank}</div>
            <div className="lb-name">
              <span className="lb-portfolio">{entry.name}</span>
              {entry.is_mine && <span className="lb-you">you</span>}
              <span className="lb-owner">{entry.owner.display_name}</span>
            </div>
            <div className="lb-holdings">
              {entry.holdings_count}
              {/* How much of the book is uninvested. A percentage, so it is
                  public, and it says how the return was actually earned. */}
              <span className="lb-cash">{entry.cash_weight_pct.toFixed(0)}% cash</span>
            </div>
            <div
              className={`lb-return ${entry.return_pct >= 0 ? "gain" : "loss"}`}
            >
              {percent(entry.return_pct)}
            </div>
            <div className="lb-actions">
              <button onClick={() => navigate(`/investor/${entry.id}`)}>
                View
              </button>
              {!entry.is_mine && (
                <button onClick={() => navigate(`/compare/${entry.id}`)}>
                  Compare
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && <p>No portfolios yet.</p>}
    </div>
  );
};

export default Leaderboard;
