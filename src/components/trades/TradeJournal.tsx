import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

/* ===========================================================================
   The public trade journal for one investor.
   ---------------------------------------------------------------------------
   Every recorded buy and sell, newest first, with the date and time and the
   owner's reasoning. This is the part other users read.
   =========================================================================== */

const API = import.meta.env.VITE_BACKEND_API_URL;

export interface JournalEntry {
  id: number;
  stock_symbol: string;
  action: "buy" | "sell";
  quantity: number;
  price: number;
  note: string;
  occurred_at: string;
  created_at: string;
  backdated: boolean;
}

interface Props {
  userId: number;
  /** Bump to force a refetch after recording a trade */
  refreshKey?: number;
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const TradeJournal: React.FC<Props> = ({ userId, refreshKey = 0 }) => {
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
        const res = await axiosInstance.get(`${API}/social/users/${userId}/journal`);
        if (cancelled) return;
        setEntries(res.data.entries || []);
        setDisplayName(res.data.user?.display_name || "");
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
  }, [userId, refreshKey]);

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
              <span className="journal-figures">
                {entry.quantity} × ${entry.price.toFixed(2)}
                <span className="journal-total">
                  = ${(entry.quantity * entry.price).toFixed(2)}
                </span>
              </span>
            </div>

            <p className="journal-note">{entry.note}</p>

            <div className="journal-meta">
              <time dateTime={entry.occurred_at}>
                {formatDateTime(entry.occurred_at)}
              </time>
              {/* A trade dated well before it was written up is shown as such,
                  rather than being quietly presented as contemporaneous. */}
              {entry.backdated && (
                <span
                  className="journal-backdated"
                  title={`Written ${formatDateTime(entry.created_at)}`}
                >
                  recorded later
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
