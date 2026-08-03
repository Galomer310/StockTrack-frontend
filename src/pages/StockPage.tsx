import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StockDetailPanel from "../components/stock/StockDetailPanel";

// Full detail view for one ticker, reached by clicking a holding in any
// portfolio. Same panel the search page renders, so the two cannot drift.
const StockPage = () => {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [quotaLeft, setQuotaLeft] = useState<number | null>(null);

  const symbol = String(ticker || "").toUpperCase();

  return (
    <div className="stock-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {quotaLeft !== null && (
        <p className={quotaLeft <= 5 ? "quota-warning" : "quota-note"}>
          {quotaLeft} of today's market data requests remaining
          {quotaLeft <= 5 && " — resets at midnight UTC"}
        </p>
      )}

      <StockDetailPanel symbol={symbol} allowAdd onQuota={setQuotaLeft} />
    </div>
  );
};

export default StockPage;
