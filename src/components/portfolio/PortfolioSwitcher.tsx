import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { setActivePortfolio } from "../../features/portfolioSlice";
import {
  fetchMyPortfolios,
  createPortfolio,
  MyPortfolio,
} from "../../api/portfolios";
import { money, percent } from "../../api/social";
import { useToast } from "../ui/ToastProvider";
import { useLanguage } from "../../i18n/LanguageContext";
import { fill, serverMessage } from "../../i18n/fill";
import { requestProgressionCheck } from "../../api/progression";

/* ===========================================================================
   Choosing which portfolio you are working in.
   ---------------------------------------------------------------------------
   Sits at the top of the personal area. Every card is one book: what it is
   worth, what it has returned against the $10,000 it opened with, and how much
   cash is still uninvested.

   Selecting one stores it in the portfolio slice, which axiosInstance turns
   into a header on every subsequent request - so the holdings below, and any
   trade made from anywhere in the app, belong to the book selected here.
   =========================================================================== */

interface Props {
  /** Bumped by the parent after a trade, to re-read cash and equity */
  refreshKey?: number;
  /** Told to the parent so it can refetch holdings when the book changes */
  onPortfolioChange?: (portfolio: MyPortfolio | null) => void;
}

const PortfolioSwitcher: React.FC<Props> = ({ refreshKey = 0, onPortfolioChange }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { t, lang } = useLanguage();
  const activeId = useSelector((state: RootState) => state.portfolio.activeId);

  const [portfolios, setPortfolios] = useState<MyPortfolio[]>([]);
  const [limit, setLimit] = useState(3);
  const [startingCash, setStartingCash] = useState(10000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchMyPortfolios();
        if (cancelled) return;
        setPortfolios(data.portfolios);
        setLimit(data.limit);
        setStartingCash(data.starting_cash);

        // Settle on a valid selection. A stored id can point at a portfolio
        // that no longer exists, or belong to whoever used this browser last,
        // so it is only honoured if it is really in the list.
        const stored = data.portfolios.find((p) => p.id === activeId);
        const chosen = stored ?? data.portfolios[0] ?? null;
        if (chosen && chosen.id !== activeId) {
          dispatch(setActivePortfolio(chosen.id));
        }
        onPortfolioChange?.(chosen);
      } catch {
        if (!cancelled) setError(t("pf_load_failed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // activeId is deliberately not a dependency: selecting a portfolio should
    // not refetch the list, and the selection is reconciled above on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, refreshKey]);

  const select = (portfolio: MyPortfolio) => {
    if (portfolio.id === activeId) return;
    dispatch(setActivePortfolio(portfolio.id));
    onPortfolioChange?.(portfolio);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || submitting) return;
    setSubmitting(true);
    try {
      const created = await createPortfolio(name);
      requestProgressionCheck(); // portfolio milestones
      setPortfolios((prev) => [...prev, created]);
      dispatch(setActivePortfolio(created.id));
      onPortfolioChange?.(created);
      setNewName("");
      setCreating(false);
      toast.success(
        fill(t("pf_created"), { name: created.name, cash: money(created.cash) }),
        t("pf_created_title")
      );
    } catch (err: any) {
      toast.error(
        serverMessage(err, lang, { PORTFOLIO_LIMIT_REACHED: t("pf_limit_reached") }, t("pf_create_failed"))
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="stock-panel-loading">{t("pf_loading")}</p>;
  if (error) return <p className="error">{error}</p>;

  const atLimit = portfolios.length >= limit;

  return (
    <section className="portfolio-switcher">
      <div className="switcher-head">
        <h3>{t("pf_heading")}</h3>
        <span className="switcher-count">
          {fill(t("pf_count"), { n: portfolios.length, limit })}
        </span>
      </div>

      <div className="portfolio-cards">
        {portfolios.map((p) => (
          <button
            key={p.id}
            className={`portfolio-card${p.id === activeId ? " is-active" : ""}`}
            onClick={() => select(p)}
            aria-pressed={p.id === activeId}
          >
            <span className="portfolio-card-name">
              {p.name}
              {p.id === activeId && <span className="lb-you">{t("pf_open_badge")}</span>}
            </span>
            <span className="portfolio-card-equity">{money(p.equity)}</span>
            <span
              className={`portfolio-card-return ${p.return_pct >= 0 ? "gain" : "loss"}`}
            >
              <bdi dir="ltr">{percent(p.return_pct)}</bdi>
            </span>
            <span className="portfolio-card-cash">
              {fill(t(p.holdings_count === 1 ? "pf_cash_one" : "pf_cash_other"), {
                cash: money(p.cash),
                n: p.holdings_count,
              })}
            </span>
          </button>
        ))}

        {/* Opening another book, up to the account's limit. */}
        {!atLimit &&
          (creating ? (
            <form className="portfolio-card portfolio-card-new" onSubmit={handleCreate}>
              <input
                type="text"
                autoFocus
                value={newName}
                maxLength={40}
                placeholder={t("pf_name_placeholder")}
                onChange={(e) => setNewName(e.target.value)}
              />
              <span className="field-hint">{fill(t("pf_opens_with"), { cash: money(startingCash) })}</span>
              <div className="modal-actions">
                <button type="button" onClick={() => setCreating(false)} disabled={submitting}>
                  {t("cancel")}
                </button>
                <button type="submit" disabled={!newName.trim() || submitting}>
                  {submitting ? t("pf_opening") : t("pf_open")}
                </button>
              </div>
            </form>
          ) : (
            <button
              className="portfolio-card portfolio-card-add"
              onClick={() => setCreating(true)}
            >
              <span className="portfolio-add-plus" aria-hidden="true">
                +
              </span>
              <span>{t("pf_new")}</span>
              <span className="field-hint">{fill(t("pf_starts_with"), { cash: money(startingCash) })}</span>
            </button>
          ))}
      </div>

      {atLimit && (
        <p className="field-hint switcher-limit">
          {fill(t("pf_at_limit"), { limit })}
        </p>
      )}
    </section>
  );
};

export default PortfolioSwitcher;
