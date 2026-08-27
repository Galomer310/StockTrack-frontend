import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { percentOrDash, dateTime } from "../../api/social";

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
        setError(
          err.response?.status === 403
            ? "You do not have access to this journal."
            : "Could not load the trade journal."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [portfolioId, refreshKey]);

  if (loading) return <p className="stock-panel-loading">Loading journal…</p>;
  if (error) return <p className="error">{error}</p>;

  if (entries.length === 0) {
    return (
      <p className="stock-empty">
        {isSelf
          ? "No trades recorded yet. Your reasoning will appear here each time you buy or sell."
          : `${displayName} has not recorded any trades yet.`}
      </p>
    );
  }

  return (
    <ol className="journal">
      {entries.map((entry) => (
        <li key={entry.id} className={`journal-entry journal-${entry.action}`}>
          <div className="journal-marker" aria-hidden="true" />

          <div className="journal-body">
            <div className="journal-head">
              <span className={`trade-badge trade-${entry.action}`}>
                {entry.action}
              </span>
              <Link className="ticker-link" to={`/stock/${entry.stock_symbol}`}>
                {entry.stock_symbol}
              </Link>

              {isSelf && entry.price !== undefined && entry.quantity !== undefined ? (
                /* Your own record: what you actually paid, and for how many. */
                <span className="journal-figures">
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
                  title={`Move in ${entry.stock_symbol} since this ${entry.action}`}
                >
                  {percentOrDash(entry.change_pct_since)}
                  <span className="journal-move-label">
                    since this {entry.action}
                  </span>
                </span>
              )}
            </div>

            <p className="journal-note">{entry.note}</p>

            <div className="journal-meta">
              <time dateTime={entry.occurred_at}>
                {dateTime(entry.occurred_at)}
              </time>
              {/* A trade dated well before it was written up is shown as such,
                  rather than being quietly presented as contemporaneous. */}
              {entry.backdated && (
                <span
                  className="journal-backdated"
                  title={`Written ${dateTime(entry.created_at)}`}
                >
                  recorded later
                </span>
              )}
              {/* The owner sees the move too, alongside their own figures. */}
              {isSelf && entry.change_pct_since !== null && (
                <span
                  className={
                    entry.change_pct_since >= 0 ? "journal-move-inline gain" : "journal-move-inline loss"
                  }
                >
                  {percentOrDash(entry.change_pct_since)} since
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
