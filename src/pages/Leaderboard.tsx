import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import {
  fetchLeaderboard,
  LeaderboardEntry,
  money,
  percent,
} from "../api/social";

// Ranks every account by percentage return since the account was opened, so a
// small portfolio can out-rank a large one on skill rather than capital.
const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const me = useSelector((state: RootState) => state.auth.user);

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
        Ranked by total return since each account was opened.
      </p>

      <div className="leaderboard-table">
        <div className="leaderboard-row leaderboard-head">
          <div className="lb-rank">#</div>
          <div className="lb-name">Investor</div>
          <div className="lb-holdings">Holdings</div>
          <div className="lb-value">Value</div>
          <div className="lb-return">Return</div>
          <div className="lb-actions"></div>
        </div>

        {entries.map((entry) => {
          const isMe = me?.id === entry.id;
          return (
            <div
              key={entry.id}
              className={`leaderboard-row${isMe ? " is-me" : ""}`}
            >
              <div className="lb-rank">{entry.rank}</div>
              <div className="lb-name">
                {entry.display_name}
                {isMe && <span className="lb-you">you</span>}
              </div>
              <div className="lb-holdings">{entry.holdings_count}</div>
              <div className="lb-value">{money(entry.current_value)}</div>
              <div
                className={`lb-return ${entry.return_pct >= 0 ? "gain" : "loss"}`}
              >
                {percent(entry.return_pct)}
                <span className="lb-profit">{money(entry.profit)}</span>
              </div>
              <div className="lb-actions">
                <button onClick={() => navigate(`/investor/${entry.id}`)}>
                  View
                </button>
                {!isMe && (
                  <button onClick={() => navigate(`/compare/${entry.id}`)}>
                    Compare
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {entries.length === 0 && <p>No accounts yet.</p>}
    </div>
  );
};

export default Leaderboard;
