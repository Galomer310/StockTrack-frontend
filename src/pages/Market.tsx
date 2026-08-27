import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ===========================================================================
   Market.
   ---------------------------------------------------------------------------
   Somewhere to go and look something up before making a decision. Everything
   here leaves the app, so every link is marked as such and opens in a new tab
   with rel="noreferrer" - nothing about this session travels to them.

   The ticker box deep-links into whichever site you pick, so "check NVDA on
   Yahoo" is one step rather than four.
   =========================================================================== */

interface Destination {
  name: string;
  blurb: string;
  /** The site's front page */
  home: string;
  /** Deep link for one ticker, or null when the site has no clean pattern */
  quote: ((symbol: string) => string) | null;
}

const DESTINATIONS: Destination[] = [
  {
    name: "Yahoo Finance",
    blurb: "Quotes, financials and filings. The most complete free source.",
    home: "https://finance.yahoo.com",
    quote: (s) => `https://finance.yahoo.com/quote/${s}`,
  },
  {
    name: "Google Finance",
    blurb: "Fast, clean quotes and the news that moved them.",
    home: "https://www.google.com/finance",
    quote: (s) => `https://www.google.com/finance/quote/${s}:NASDAQ`,
  },
  {
    name: "TradingView",
    blurb: "Charting, and where most technical setups get argued about.",
    home: "https://www.tradingview.com",
    quote: (s) => `https://www.tradingview.com/symbols/${s}/`,
  },
  {
    name: "MarketWatch",
    blurb: "Market news with a bias towards what happened today.",
    home: "https://www.marketwatch.com",
    quote: (s) => `https://www.marketwatch.com/investing/stock/${s}`,
  },
  {
    name: "Investing.com",
    blurb: "Broad coverage, including the economic calendar.",
    home: "https://www.investing.com",
    quote: null,
  },
  {
    name: "SEC EDGAR",
    blurb: "The filings themselves, before anyone has summarised them.",
    home: "https://www.sec.gov/edgar/search/",
    quote: (s) =>
      `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&ticker=${s}&type=10-K&dateb=&owner=include&count=40`,
  },
  {
    name: "Finviz",
    blurb: "Screener and heat map. Good for seeing the whole market at once.",
    home: "https://finviz.com",
    quote: (s) => `https://finviz.com/quote.ashx?t=${s}`,
  },
  {
    name: "CNBC",
    blurb: "Live coverage while the market is open.",
    home: "https://www.cnbc.com/markets/",
    quote: (s) => `https://www.cnbc.com/quotes/${s}`,
  },
];

const Market = () => {
  const [ticker, setTicker] = useState("");
  const navigate = useNavigate();
  const symbol = ticker.trim().toUpperCase();

  return (
    <div className="market-page">
      <h2>Market</h2>
      <p className="leaderboard-subtitle">
        Research a ticker before you commit to it. These all open elsewhere —
        your portfolio and your positions stay here.
      </p>

      {/* Type a ticker once, then jump to it on any of the sites below. */}
      <form
        className="market-lookup"
        onSubmit={(e) => {
          e.preventDefault();
          if (symbol) navigate(`/stock/${symbol}`);
        }}
      >
        <input
          type="text"
          value={ticker}
          placeholder="Ticker, e.g. NVDA"
          onChange={(e) => setTicker(e.target.value)}
          aria-label="Ticker symbol"
        />
        <button type="submit" disabled={!symbol}>
          Open {symbol || "here"}
        </button>
        <span className="field-hint">
          {symbol
            ? `Opens ${symbol} in Investments. The cards below deep-link to ${symbol} on each site.`
            : "Enter a ticker to deep-link it on every site below."}
        </span>
      </form>

      <div className="market-grid">
        {DESTINATIONS.map((d) => {
          // With a ticker typed, the card points straight at that symbol
          // wherever the site supports it; otherwise it goes to the front page.
          const href = symbol && d.quote ? d.quote(symbol) : d.home;
          const deepLinked = Boolean(symbol && d.quote);
          return (
            <a
              key={d.name}
              className="market-card"
              href={href}
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className="market-card-name">
                {d.name}
                <span className="market-external" aria-hidden="true">
                  ↗
                </span>
              </span>
              <span className="market-card-blurb">{d.blurb}</span>
              <span className="field-hint">
                {deepLinked ? `Goes straight to ${symbol}` : new URL(d.home).hostname}
              </span>
            </a>
          );
        })}
      </div>

      <p className="compare-note market-disclaimer">
        These are third-party sites, listed for convenience. Nothing here is a
        recommendation, and none of them can see your account.
      </p>
    </div>
  );
};

export default Market;
