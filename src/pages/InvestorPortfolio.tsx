import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import TradeJournal from "../components/trades/TradeJournal";
import { FollowButton } from "../components/social/FollowButton";
import {
  fetchPortfolio,
  PortfolioResponse,
  OwnHolding,
  PublicHolding,
  isOwnHolding,
  money,
  percent,
} from "../api/social";
import { useLanguage } from "../i18n/LanguageContext";
import { MessageKey } from "../i18n/messages";
import { fill, ltr } from "../i18n/fill";

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

   Translated: right to left in Hebrew; names keep their own direction, and
   money and signed percentages stay left to right.
   =========================================================================== */
const InvestorPortfolio = () => {
  const { t, dir, lang, locale } = useLanguage();
  // Inside Hebrew sentences, names keep their own direction.
  const iso = (value: string) => (lang === "he" ? ltr(value) : value);
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<MessageKey | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await fetchPortfolio(Number(id)));
      } catch (err: any) {
        // 403 is what the future paid-tier gate will return.
        setError(err.response?.status === 403 ? "portfolio_no_access" : "inv_failed");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="investor-page" dir={dir} lang={lang}><p>{t("inv_loading")}</p></div>;
  if (error) return <div className="investor-page" dir={dir} lang={lang}><p className="error">{t(error)}</p></div>;
  if (!data) return null;

  const { portfolio, owner, summary, holdings, is_self } = data;

  return (
    <div className="investor-page" dir={dir} lang={lang}>
      <button className="back-btn" onClick={() => navigate("/leaderboard")}>
        {t("back_to_leaderboard")}
      </button>

      <h2>
        <bdi>{portfolio.name}</bdi>
        {is_self && <span className="lb-you">{t("you_badge")}</span>}
      </h2>
      <p className="investor-since">
        {fill(t("inv_owner_opened"), {
          name: iso(owner.display_name),
          date: new Date(portfolio.created_at).toLocaleDateString(locale),
        })}
      </p>
      {/* Following is per player, not per portfolio. Hidden on your own. */}
      {!is_self && <FollowButton playerId={owner.id} />}

      <div className="summary-cards">
        {/* Total return is the whole story for a visitor. */}
        <div className="summary-card">
          <span className="summary-label">{t("total_return")}</span>
          <span
            className={`summary-value ${summary.return_pct >= 0 ? "gain" : "loss"}`}
          >
            <bdi dir="ltr">{percent(summary.return_pct)}</bdi>
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">{t("col_holdings")}</span>
          <span className="summary-value">{summary.holdings_count}</span>
        </div>
        {/* A ratio, so everyone sees it: how much of the book is uninvested
            says as much about the strategy as the return does. */}
        <div className="summary-card">
          <span className="summary-label">{t("inv_in_cash")}</span>
          <span className="summary-value"><bdi dir="ltr">{summary.cash_weight_pct.toFixed(1)}%</bdi></span>
        </div>

        {/* Your own figures, which nobody else receives. */}
        {is_self && summary.equity !== undefined && (
          <>
            <div className="summary-card">
              <span className="summary-label">{t("inv_equity")}</span>
              <span className="summary-value"><bdi dir="ltr">{money(summary.equity)}</bdi></span>
            </div>
            <div className="summary-card">
              <span className="summary-label">{t("inv_cash")}</span>
              <span className="summary-value"><bdi dir="ltr">{money(summary.cash ?? 0)}</bdi></span>
            </div>
            <div className="summary-card">
              <span className="summary-label">{t("inv_opened_with")}</span>
              <span className="summary-value"><bdi dir="ltr">{money(summary.starting_balance ?? 0)}</bdi></span>
            </div>
            <div className="summary-card">
              <span className="summary-label">{t("profit_loss")}</span>
              <span
                className={`summary-value ${(summary.profit ?? 0) >= 0 ? "gain" : "loss"}`}
              >
                <bdi dir="ltr">{money(summary.profit ?? 0)}</bdi>
              </span>
            </div>
          </>
        )}
      </div>

      {!is_self && (
        <>
          <p className="privacy-note">{fill(t("inv_privacy"), { name: iso(owner.display_name) })}</p>
          <button
            className="compare-btn"
            onClick={() => navigate(`/compare/${portfolio.id}`)}
          >
            {t("inv_compare")}
          </button>
        </>
      )}

      <h3>{t("inv_journal")}</h3>
      <p className="compare-note">
        {is_self ? t("inv_journal_self") : fill(t("inv_journal_other"), { name: iso(owner.display_name) })}
      </p>
      <TradeJournal portfolioId={portfolio.id} />

      <h3>{t("col_holdings")}</h3>
      {holdings.length === 0 ? (
        <p>{t("inv_no_holdings")}</p>
      ) : is_self ? (
        /* Your own book, in full. */
        <div className="table-wrap">
          <table className="holdings-table">
            <thead>
              <tr>
                <th>{t("col_ticker")}</th>
                <th>{t("col_bought_at")}</th>
                <th>{t("col_latest")}</th>
                <th>{t("col_qty")}</th>
                <th>{t("col_added")}</th>
                <th>{t("profit_loss")}</th>
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
                  <td><bdi dir="ltr">{money(h.price_at_time)}</bdi></td>
                  <td><bdi dir="ltr">{money(h.latest_price)}</bdi></td>
                  <td>{h.quantity}</td>
                  <td>{new Date(h.added_at).toLocaleDateString(locale)}</td>
                  <td className={h.profit_loss >= 0 ? "gain" : "loss"}>
                    <bdi dir="ltr">{money(h.profit_loss)}</bdi>
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
                <th>{t("col_ticker")}</th>
                <th>{t("col_held_since")}</th>
                <th>{t("col_share")}</th>
                <th>{t("col_return")}</th>
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
                  <td>{new Date(h.added_at).toLocaleDateString(locale)}</td>
                  <td>
                    <span className="weight-bar" aria-hidden="true">
                      <span
                        className="weight-bar-fill"
                        style={{ width: `${Math.min(h.weight_pct, 100)}%` }}
                      />
                    </span>
                    <bdi dir="ltr">{h.weight_pct.toFixed(1)}%</bdi>
                  </td>
                  <td className={h.gain_pct >= 0 ? "gain" : "loss"}>
                    <bdi dir="ltr">{percent(h.gain_pct)}</bdi>
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
