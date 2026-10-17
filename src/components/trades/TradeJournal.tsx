import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { percentOrDash, dateTime } from "../../api/social";
import { useLanguage } from "../../i18n/LanguageContext";
import { fill, ltr } from "../../i18n/fill";

/* ===========================================================================
   The public trade journal for one investor.
   ---------------------------------------------------------------------------
   Every recorded buy and sell, newest first, with the date and time it was
   taken and the owner's reasoning.

   What a reader sees depends on who they are, and the server decides it: the
   owner gets the size and the price of each trade, everyone else gets the
   percentage the stock has moved since it was made. A viewer can therefore see
   that a call was good or bad, and exactly when it was taken, without learning
   what was paid.

   Translated, and sets its own direction: it appears on the dashboard and
   on other investors' pages, which are not all ported yet.
   =========================================================================== */

const API = import.meta.env.VITE_BACKEND_API_URL;

export interface JournalEntry {
  id: number;
  stock_symbol: string;
  action: "buy" | "sell";
  note: string;
  occurred_at: string;
  created_at: string;
  backdated: boolean;
  /** Percentage the stock has moved since this trade. null when uncached. */
  change_pct_since: number | null;
  /** Owner only. */
  quantity?: number;
  /** Owner only. */
  price?: number;
}

interface Props {
  /** The portfolio whose trades to show. The unit is the book, not the user. */
  portfolioId: number;
  /** Bump to force a refetch after recording a trade */
  refreshKey?: number;
}

const TradeJournal: React.FC<Props> = ({ portfolioId, refreshKey = 0 }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [isSelf, setIsSelf] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t, dir, lang, locale } = useLanguage();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get(
          `${API}/social/portfolios/${portfolioId}/journal`
        );
        if (cancelled) return;
        setEntries(res.data.entries || []);
        setDisplayName(res.data.owner?.display_name || "");
        setIsSelf(Boolean(res.data.is_self));
      } catch (err: any) {
        if (cancelled) return;
        setError(err.response?.status === 403 ? t("journal_no_access") : t("journal_failed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // t is left out on purpose: switching language should not refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioId, refreshKey]);

  if (loading) return <p className="stock-panel-loading" dir={dir} lang={lang}>{t("journal_loading")}</p>;
  if (error) return <p className="error" dir={dir} lang={lang}>{error}</p>;

  if (entries.length === 0) {
    return (
      <p className="stock-empty" dir={dir} lang={lang}>
        {isSelf ? t("journal_empty_self") : fill(t("journal_empty_other"), { name: displayName })}
      </p>
    );
  }

  return (
    <ol className="journal" dir={dir} lang={lang}>
      {entries.map((entry) => (
        <li key={entry.id} className={`journal-entry journal-${entry.action}`}>
          <div className="journal-marker" aria-hidden="true" />

          <div className="journal-body">
            <div className="journal-head">
              <span className={`trade-badge trade-${entry.action}`}>
                {t(entry.action === "buy" ? "trade_buy" : "trade_sell")}
              </span>
              <Link className="ticker-link" to={`/stock/${entry.stock_symbol}`}>
                {entry.stock_symbol}
              </Link>

              {isSelf && entry.price !== undefined && entry.quantity !== undefined ? (
                /* Your own record: what you actually paid, and for how many. */
                <span className="journal-figures" dir="ltr">
                  {entry.quantity} × ${entry.price.toFixed(2)}
                  <span className="journal-total">
                    = ${(entry.quantity * entry.price).toFixed(2)}
                  </span>
                </span>
              ) : (
                /* Everyone else: how the stock has moved since, and nothing
                   from which a price could be worked back out. */
                <span
                  className={`journal-move ${
                    (entry.change_pct_since ?? 0) >= 0 ? "gain" : "loss"
                  }`}
                  title={fill(t(entry.action === "buy" ? "journal_move_title_buy" : "journal_move_title_sell"), {
                    symbol: entry.stock_symbol,
                  })}
                >
                  <bdi dir="ltr">{percentOrDash(entry.change_pct_since)}</bdi>
                  <span className="journal-move-label">
                    {t(entry.action === "buy" ? "journal_since_buy" : "journal_since_sell")}
                  </span>
                </span>
              )}
            </div>

            <p className="journal-note" dir="auto">{entry.note}</p>

            <div className="journal-meta">
              <time dateTime={entry.occurred_at}>
                {dateTime(entry.occurred_at, locale)}
              </time>
              {/* A trade dated well before it was written up is shown as such,
                  rather than being quietly presented as contemporaneous. */}
              {entry.backdated && (
                <span
                  className="journal-backdated"
                  title={fill(t("journal_written"), { date: dateTime(entry.created_at, locale) })}
                >
                  {t("journal_recorded_later")}
                </span>
              )}
              {/* The owner sees the move too, alongside their own figures. */}
              {isSelf && entry.change_pct_since !== null && (
                <span
                  className={
                    entry.change_pct_since >= 0 ? "journal-move-inline gain" : "journal-move-inline loss"
                  }
                >
                  {fill(t("journal_since"), { pct: ltr(percentOrDash(entry.change_pct_since)) })}
                </span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default TradeJournal;
