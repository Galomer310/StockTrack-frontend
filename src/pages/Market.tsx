import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { MessageKey } from "../i18n/messages";
import { fill, ltr } from "../i18n/fill";

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
  /** A brand name, so the same in both languages */
  name: string;
  blurb: MessageKey;
  /** The site's front page */
  home: string;
  /** Deep link for one ticker, or null when the site has no clean pattern */
  quote: ((symbol: string) => string) | null;
}

const DESTINATIONS: Destination[] = [
  {
    name: "Yahoo Finance",
    blurb: "market_blurb_yahoo",
    home: "https://finance.yahoo.com",
    quote: (s) => `https://finance.yahoo.com/quote/${s}`,
  },
  {
    name: "Google Finance",
    blurb: "market_blurb_google",
    home: "https://www.google.com/finance",
    quote: (s) => `https://www.google.com/finance/quote/${s}:NASDAQ`,
  },
  {
    name: "TradingView",
    blurb: "market_blurb_tradingview",
    home: "https://www.tradingview.com",
    quote: (s) => `https://www.tradingview.com/symbols/${s}/`,
  },
  {
    name: "MarketWatch",
    blurb: "market_blurb_marketwatch",
    home: "https://www.marketwatch.com",
    quote: (s) => `https://www.marketwatch.com/investing/stock/${s}`,
  },
  {
    name: "Investing.com",
    blurb: "market_blurb_investing",
    home: "https://www.investing.com",
    quote: null,
  },
  {
    name: "SEC EDGAR",
    blurb: "market_blurb_edgar",
    home: "https://www.sec.gov/edgar/search/",
    quote: (s) =>
      `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&ticker=${s}&type=10-K&dateb=&owner=include&count=40`,
  },
  {
    name: "Finviz",
    blurb: "market_blurb_finviz",
    home: "https://finviz.com",
    quote: (s) => `https://finviz.com/quote.ashx?t=${s}`,
  },
  {
    name: "CNBC",
    blurb: "market_blurb_cnbc",
    home: "https://www.cnbc.com/markets/",
    quote: (s) => `https://www.cnbc.com/quotes/${s}`,
  },
];

const Market = () => {
  const [ticker, setTicker] = useState("");
  const navigate = useNavigate();
  const { t, dir, lang } = useLanguage();
  const symbol = ticker.trim().toUpperCase();
  // Inside Hebrew text the symbol is isolated so it keeps its own direction.
  // English needs no marks, and copied text stays free of invisible characters.
  const sym = lang === "he" ? ltr(symbol) : symbol;

  return (
    <div className="market-page" dir={dir} lang={lang}>
      <h2>{t("market_title")}</h2>
      <p className="leaderboard-subtitle">{t("market_subtitle")}</p>

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
          // Empty, the placeholder follows the page; a typed ticker reads left to right.
          dir={ticker ? "ltr" : dir}
          placeholder={t("market_ticker_placeholder")}
          onChange={(e) => setTicker(e.target.value)}
          aria-label={t("market_ticker_label")}
        />
        <button type="submit" disabled={!symbol}>
          {symbol ? fill(t("market_open"), { symbol: sym }) : t("market_open_here")}
        </button>
        <span className="field-hint">
          {symbol
            ? fill(t("market_hint_symbol"), { symbol: sym })
            : t("market_hint_empty")}
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
              <span className="market-card-blurb">{t(d.blurb)}</span>
              <span className="field-hint">
                {deepLinked ? (
                  fill(t("market_goes_to"), { symbol: sym })
                ) : (
                  <bdi dir="ltr">{new URL(d.home).hostname}</bdi>
                )}
              </span>
            </a>
          );
        })}
      </div>

      <p className="compare-note market-disclaimer">{t("market_disclaimer")}</p>
    </div>
  );
};

export default Market;
