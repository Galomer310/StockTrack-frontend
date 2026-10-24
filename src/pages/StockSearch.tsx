// frontend/src/pages/StockSearch.tsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import StockDetailPanel from "../components/stock/StockDetailPanel";
import { useLanguage } from "../i18n/LanguageContext";
import { MessageKey } from "../i18n/messages";
import { fill } from "../i18n/fill";

const API = import.meta.env.VITE_BACKEND_API_URL;

// The server's closed-market reasons are fixed English phrases. Hebrew shows
// its own wording for each, and a general line for any it does not know.
const REASONS: Record<string, MessageKey> = {
  Weekend: "market_reason_weekend",
  "Before the opening bell": "market_reason_before_open",
  "After the closing bell": "market_reason_after_close",
};

// Search for a ticker, then render the shared detail panel for it. All of the
// quote/profile/chart/news rendering lives in that panel so this page and
// /stock/:ticker can never diverge.
const StockSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [symbol, setSymbol] = useState(""); // the submitted ticker
  // The reason the market is closed, or null while it is open. Kept raw so the
  // banner follows a language switch.
  const [closedReason, setClosedReason] = useState<string | null>(null);
  const [quotaLeft, setQuotaLeft] = useState<number | null>(null);

  const [searchDisabled, setSearchDisabled] = useState(false);
  const [countdown, setCountdown] = useState(12);

  // Market status is derived from the clock server-side, so polling it does
  // not spend any of the daily request budget.
  useEffect(() => {
    const checkMarket = async () => {
      try {
        const res = await axiosInstance.get(`${API}/stocks/market-status`);
        setClosedReason(res.data.is_open ? null : String(res.data.reason ?? ""));
      } catch {
        /* non-critical banner */
      }
    };
    checkMarket();
    const interval = setInterval(checkMarket, 60000);
    return () => clearInterval(interval);
  }, []);

  // Cooldown between searches, since each one spends several requests.
  useEffect(() => {
    let timer: number;
    if (searchDisabled) {
      timer = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setSearchDisabled(false);
            return 12;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [searchDisabled]);

  const { t, dir, lang } = useLanguage();
  const reasonKey = closedReason === null ? undefined : REASONS[closedReason];
  const reasonText = lang === "en" ? closedReason : reasonKey && t(reasonKey);
  const marketNote =
    closedReason === null
      ? null
      : reasonText
        ? fill(t("market_closed"), { reason: reasonText })
        : t("market_closed_plain");

  const submit = () => {
    const next = query.trim().toUpperCase();
    if (!next || searchDisabled) return;
    setSymbol(next);
    setSearchDisabled(true);
    setCountdown(12);
  };

  return (
    <div className="stock-search" dir={dir} lang={lang}>
      <h2>{t("search_title")}</h2>
      <p>{t("search_intro")}</p>
      <p>{t("search_examples")}</p>

      {/* The plan allows 5 requests a minute, so a running count would be
          noise; speak up only when the minute's budget is nearly spent. */}
      {quotaLeft !== null && quotaLeft <= 1 && (
        <p className="quota-warning">{t("quota_busy")}</p>
      )}

      <div className="search-row">
        <input
          type="text"
          // Empty, the placeholder follows the page; a typed ticker reads left to right.
          dir={query ? "ltr" : dir}
          placeholder={t("search_placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button onClick={submit} disabled={searchDisabled}>
          {searchDisabled ? fill(t("search_wait"), { n: countdown }) : t("search_button")}
        </button>
      </div>

      {marketNote && <p className="market-status">{marketNote}</p>}

      {symbol ? (
        <StockDetailPanel symbol={symbol} allowAdd onQuota={setQuotaLeft} />
      ) : (
        <p className="stock-empty">{t("search_empty")}</p>
      )}
    </div>
  );
};

export default StockSearch;
