import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  fetchJournal,
  fetchPortfolio,
  isOwnHolding,
  money,
  PortfolioResponse,
  PublicJournalEntry,
} from "../api/social";
import PlayerAvatar from "../components/avatars/PlayerAvatar";
import { FollowButton } from "../components/social/FollowButton";
import { Verdict } from "../components/activity/ActivityJournal";
import "../components/activity/activity.css";
import { fill } from "../i18n/fill";
import { useLanguage } from "../i18n/LanguageContext";
import { MessageKey } from "../i18n/messages";
import "./investor.css";

/* ===========================================================================
   One portfolio, as anyone sees it: the page the Arena, the boards and
   Discover lead to (approved design, 2026-11).
   ---------------------------------------------------------------------------
   Its return since opening as the one big figure, its holdings by share of
   the book and their move, and its decisions as a journal: what was done
   and when, the reasoning written at the time, and how each decision has
   aged against the S&P 500 since.

   The server decides what is visible (src/controllers/leaderboardController):
   percentages only for anyone but the owner. Who may see holdings and
   decisions at all will follow the subscriptions decision (open item).
   =========================================================================== */

const signed = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)}%`;
const tone = (v: number | null | undefined) => (v === null || v === undefined ? "" : v > 0 ? "is-up" : v < 0 ? "is-down" : "");

const InvestorPortfolio = () => {
  const { t, dir, lang, locale } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [journal, setJournal] = useState<PublicJournalEntry[] | null>(null);
  const [error, setError] = useState<MessageKey | null>(null);

  useEffect(() => {
    setData(null);
    setJournal(null);
    setError(null);
    const pid = Number(id);
    fetchPortfolio(pid)
      .then(setData)
      .catch((err) => setError(err.response?.status === 403 ? "portfolio_no_access" : "inv_failed"));
    fetchJournal(pid)
      .then((j) => setJournal(j.entries))
      .catch(() => setJournal([]));
  }, [id]);

  const n = (v: number) => new Intl.NumberFormat(locale).format(v);
  if (error) return <div className="iv-page" dir={dir} lang={lang}><p className="iv-error" role="alert">{t(error)}</p></div>;
  if (!data) return <div className="iv-page" dir={dir} lang={lang}><p className="iv-muted iv-center" role="status">{t("inv_loading")}</p></div>;

  const { portfolio, owner, summary, holdings, is_self } = data;
  const ownerName = owner.display_name;
  const judged = (journal ?? []).filter((e) => e.vs_market);
  const beat = judged.filter((e) => e.vs_market!.edge_pct > 0).length;
  const sorted = [...holdings].sort((a, b) => b.weight_pct - a.weight_pct);

  // The journal, newest first, grouped by day.
  const days: { key: string; at: string; list: PublicJournalEntry[] }[] = [];
  for (const e of journal ?? []) {
    const key = new Date(e.occurred_at).toDateString();
    const last = days[days.length - 1];
    if (last && last.key === key) last.list.push(e);
    else days.push({ key, at: e.occurred_at, list: [e] });
  }

  return (
    <div className="iv-page" dir={dir} lang={lang}>
      <header className="iv-head">
        <button type="button" className="iv-back" onClick={() => navigate(-1)}>
          {t("back_to_leaderboard")}
        </button>
        <h1><bdi dir="auto">{portfolio.name}</bdi></h1>
        <Link className="iv-owner" to={is_self ? "/player" : `/players/${owner.id}`}>
          <PlayerAvatar className="iv-av" name={ownerName} avatarId={owner.avatar_id} />
          <span>
            {fill(t("inv_owner_opened"), {
              name: ownerName,
              date: new Date(portfolio.created_at).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }),
            })}
          </span>
        </Link>
        {!is_self && <FollowButton playerId={owner.id} />}
      </header>

      <section className="iv-panel iv-hero">
        <span className="iv-cap">{t("total_return")} · {t("inv_since_open")}</span>
        <div className={`iv-big ${tone(summary.return_pct)}`}><bdi dir="ltr">{signed(summary.return_pct)}</bdi></div>
        <div className="iv-stats">
          <span>{fill(t("inv_holdings_n"), { n: n(summary.holdings_count) })}</span>
          <span>{t("inv_in_cash")} <bdi dir="ltr">{summary.cash_weight_pct.toFixed(1)}%</bdi></span>
          {is_self && summary.equity !== undefined && <span>{t("inv_equity")} <bdi dir="ltr">{money(summary.equity)}</bdi></span>}
        </div>
        {!is_self && (
          <Link className="iv-link" to={`/compare/${portfolio.id}`}>{t("inv_compare")}</Link>
        )}
      </section>

      <div className="iv-grid">
        <section className="iv-panel" aria-labelledby="iv-h-holdings">
          <div className="iv-h"><h2 id="iv-h-holdings">{t("col_holdings")}</h2></div>
          {sorted.length === 0 ? (
            <p className="iv-muted">{t("inv_no_holdings")}</p>
          ) : (
            <ul className="iv-holdings">
              {sorted.map((h) => {
                const gain = isOwnHolding(h) ? (h.price_at_time > 0 ? (h.latest_price / h.price_at_time - 1) * 100 : null) : h.gain_pct;
                return (
                  <li key={h.id}>
                    <Link className="iv-tk" to={`/stock/${h.stock_symbol}`}><bdi dir="ltr">{h.stock_symbol}</bdi></Link>
                    <span className="iv-wt" aria-hidden="true"><i style={{ inlineSize: `${Math.min(100, h.weight_pct)}%` }} /></span>
                    <bdi dir="ltr" className="iv-wt-n">{h.weight_pct.toFixed(1)}%</bdi>
                    <bdi dir="ltr" className={`iv-gain ${tone(gain)}`}>{signed(gain)}</bdi>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="iv-note">{t("col_share")} · {t("col_return")}</p>
        </section>

        <section className="iv-panel" aria-labelledby="iv-h-journal">
          <div className="iv-h"><h2 id="iv-h-journal">{t("inv_decisions")}</h2></div>
          {judged.length > 0 && (
            <div className="jr-hero">
              <div className="jr-big"><bdi dir="ltr">{n(beat)} <small>/ {n(judged.length)}</small></bdi></div>
              <div className="jr-lbl">{t("act_beat_market")}</div>
              <div className="jr-how-calc">{t("act_beat_how")}</div>
            </div>
          )}
          {journal === null ? (
            <p className="iv-muted" role="status">{t("loading")}</p>
          ) : days.length === 0 ? (
            <p className="iv-muted">{t("inv_no_journal")}</p>
          ) : (
            <div className="jr">
              {days.map((d) => (
                <section className="jr-day" key={d.key}>
                  <div className="jr-date">
                    <b>{new Date(d.at).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}</b>
                    <span>{new Date(d.at).toLocaleDateString(locale, { weekday: "long" })}</span>
                  </div>
                  {d.list.map((e) => (
                    <article className="jc" key={e.id}>
                      <span className="jc-tk" aria-hidden="true">{e.stock_symbol}</span>
                      <h3>
                        <span className={`jc-act is-${e.action}`}>{t(e.action === "buy" ? "inv_bought" : "inv_sold")}</span>
                        <span className="jc-sep">·</span>
                        <bdi dir="ltr">{e.stock_symbol}</bdi>
                      </h3>
                      <div className="jc-meta">
                        <bdi dir="ltr">{new Date(e.occurred_at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</bdi>
                        {" · "}
                        {fill(t("inv_stock_since"), { symbol: e.stock_symbol })} <bdi dir="ltr">{signed(e.change_pct_since)}</bdi>
                        {is_self && e.quantity !== undefined && e.price !== undefined && (
                          <> · {fill(t("inv_qty_price"), { qty: n(e.quantity), price: money(e.price) })}</>
                        )}
                      </div>
                      {e.vs_market && <Verdict v={e.vs_market} symbol={e.stock_symbol} buy={e.action === "buy"} />}
                      {e.note ? <p className="jc-why" dir="auto">{e.note}</p> : <p className="jc-why is-empty">{t("act_no_reason")}</p>}
                    </article>
                  ))}
                </section>
              ))}
            </div>
          )}
        </section>
      </div>

      {!is_self && <p className="iv-note iv-center">{fill(t("inv_privacy"), { name: ownerName })}</p>}
      <p className="iv-note iv-center">{t("ar_disclaimer")}</p>
    </div>
  );
};

export default InvestorPortfolio;
