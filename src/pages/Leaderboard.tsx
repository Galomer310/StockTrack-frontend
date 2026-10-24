import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchLeaderboard,
  LeaderboardEntry,
  percent,
} from "../api/social";
import { useLanguage } from "../i18n/LanguageContext";
import { fill } from "../i18n/fill";

// Ranks every portfolio by percentage return since it was opened, so a
// cautious book can out-rank a large one on skill rather than capital.
//
// The unit is the portfolio, not the account: a user runs up to three and each
// is ranked on its own, which is what makes an experimental book safe to try.
//
// Percentages only, including your own rows: portfolio values are nobody's
// business here, and every book starts from the same $10,000 anyway, so the
// percentages are directly comparable.
//
// Translated: right to left in Hebrew. Portfolio and owner names keep their
// own direction, and the signed return stays left to right.
const Leaderboard = () => {
  const { t, dir, lang } = useLanguage();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setEntries(await fetchLeaderboard());
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="leaderboard-page" dir={dir} lang={lang}><p>{t("lb_loading")}</p></div>;
  if (error) return <div className="leaderboard-page" dir={dir} lang={lang}><p className="error">{t("lb_failed")}</p></div>;

  return (
    <div className="leaderboard-page" dir={dir} lang={lang}>
      <h2>{t("lb_title")}</h2>
      <p className="leaderboard-subtitle">{t("lb_subtitle")}</p>

      <div className="leaderboard-table">
        <div className="leaderboard-row leaderboard-head">
          <div className="lb-rank">#</div>
          <div className="lb-name">{t("col_portfolio")}</div>
          <div className="lb-holdings">{t("col_holdings")}</div>
          <div className="lb-return">{t("col_return")}</div>
          <div className="lb-actions"></div>
        </div>

        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`leaderboard-row${entry.is_mine ? " is-me" : ""}`}
          >
            <div className="lb-rank">{entry.rank}</div>
            <div className="lb-name">
              <span className="lb-portfolio"><bdi>{entry.name}</bdi></span>
              {entry.is_mine && <span className="lb-you">{t("you_badge")}</span>}
              <span className="lb-owner"><bdi>{entry.owner.display_name}</bdi></span>
            </div>
            <div className="lb-holdings">
              {entry.holdings_count}
              {/* How much of the book is uninvested. A percentage, so it is
                  public, and it says how the return was actually earned. */}
              <span className="lb-cash">{fill(t("lb_cash"), { pct: entry.cash_weight_pct.toFixed(0) })}</span>
            </div>
            <div
              className={`lb-return ${entry.return_pct >= 0 ? "gain" : "loss"}`}
            >
              <bdi dir="ltr">{percent(entry.return_pct)}</bdi>
            </div>
            <div className="lb-actions">
              <button onClick={() => navigate(`/investor/${entry.id}`)}>
                {t("lb_view")}
              </button>
              {!entry.is_mine && (
                <button onClick={() => navigate(`/compare/${entry.id}`)}>
                  {t("lb_compare")}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && <p>{t("lb_empty")}</p>}
    </div>
  );
};

export default Leaderboard;
