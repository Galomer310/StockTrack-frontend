import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StockDetailPanel from "../components/stock/StockDetailPanel";
import { useLanguage } from "../i18n/LanguageContext";

// Full detail view for one ticker, reached by clicking a holding in any
// portfolio. Same panel the search page renders, so the two cannot drift.
const StockPage = () => {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [quotaLeft, setQuotaLeft] = useState<number | null>(null);
  const { t, dir, lang } = useLanguage();

  const symbol = String(ticker || "").toUpperCase();

  return (
    <div className="stock-page" dir={dir} lang={lang}>
      <button className="back-btn" onClick={() => navigate(-1)}>
        {t("stock_back")}
      </button>

      {/* The plan allows 5 requests a minute, so a running count would be
          noise; speak up only when the minute's budget is nearly spent. */}
      {quotaLeft !== null && quotaLeft <= 1 && (
        <p className="quota-warning">{t("quota_busy")}</p>
      )}

      <StockDetailPanel symbol={symbol} allowAdd onQuota={setQuotaLeft} />
    </div>
  );
};

export default StockPage;
