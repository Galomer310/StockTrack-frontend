import { CSSProperties, useEffect, useRef, useState } from "react";
import {
  announceDailyRewardsChanged,
  CapitalReward,
  previewBoost,
  RedeemError,
  RedeemErrorCode,
  redeemReward,
  RedeemResult,
  TIER_ACCENT,
  TIER_LABEL,
} from "../../api/dailyRewards";
import { fetchMyPortfolios, MyPortfolio } from "../../api/portfolios";
import { money, percent } from "../../api/social";
import { fill } from "../../i18n/fill";
import { useLanguage } from "../../i18n/LanguageContext";
import { MessageKey } from "../../i18n/messages";
import { Emblem } from "../progression/emblems";
import "../progression/progression.css";
import "./dailyRewards.css";

/* ===========================================================================
   Applying a capital growth reward (spec sections 6 and 12).
   ---------------------------------------------------------------------------
   Opens when a reward is earned ("Capital boost unlocked") or from the
   pending list. The player picks ONE portfolio; each shows its value, its
   return, what the reward would add and the value after - and that the
   return stays the same, because the capital base grows with it. The server
   recalculates from its own valuation when the player confirms; "Claim
   later" keeps the reward pending, with no expiry.
   =========================================================================== */

const ERROR_TEXT: Record<RedeemErrorCode, MessageKey> = {
  REWARD_NOT_FOUND: "dr_err_not_found",
  REWARD_ALREADY_REDEEMED: "dr_err_already",
  PORTFOLIO_NOT_FOUND: "dr_err_portfolio",
  PORTFOLIO_NOT_ELIGIBLE: "dr_err_portfolio",
  INVALID_VALUATION: "dr_err_valuation",
  UNKNOWN: "dr_err_unknown",
};

export const CapitalBoostDialog = ({
  reward,
  fresh,
  onClose,
}: {
  reward: CapitalReward | null;
  /** True when shown the moment it was earned. */
  fresh: boolean;
  onClose: () => void;
}) => {
  const { t, dir, lang, locale } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  const [portfolios, setPortfolios] = useState<MyPortfolio[] | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<MessageKey | null>(null);
  const [done, setDone] = useState<RedeemResult | null>(null);
  const n = (v: number) => new Intl.NumberFormat(locale).format(v);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (reward && !dialog.open) {
      setChosen(null);
      setError(null);
      setDone(null);
      setPortfolios(null);
      dialog.showModal();
      fetchMyPortfolios()
        .then((list) => {
          setPortfolios(list.portfolios);
          if (list.portfolios.length === 1) setChosen(list.portfolios[0].id);
        })
        .catch(() => setError("dr_err_portfolios"));
    }
    if (!reward && dialog.open) dialog.close();
  }, [reward]);

  if (!reward) return <dialog ref={ref} className="prg prg-dialog dr-boost" />;

  const accent = TIER_ACCENT[reward.tier] ?? TIER_ACCENT.quarterly;
  const pct = reward.percentage;
  const message = reward.message ? reward.message[lang] : null;
  const eligible = (portfolios ?? []).filter((p) => p.equity > 0);

  const apply = async () => {
    if (chosen === null) return;
    setBusy(true);
    setError(null);
    try {
      const result = await redeemReward(reward.id, chosen);
      setDone(result);
      announceDailyRewardsChanged();
    } catch (err) {
      setError(ERROR_TEXT[err instanceof RedeemError ? err.code : "UNKNOWN"]);
      // The reward may have been applied elsewhere meanwhile; refresh the lists.
      announceDailyRewardsChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog
      ref={ref}
      className={`prg prg-dialog dr-boost dr-tier-${reward.tier}`}
      dir={dir}
      lang={lang}
      aria-labelledby="dr-boost-title"
      style={{ "--accent": accent } as CSSProperties}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="prg-dialog-frame">
        <header className="prg-dialog-head dr-boost-head">
          <span className="dr-boost-emblem" aria-hidden="true">
            <Emblem name={reward.tier === "quarterly" ? "mogul_crown" : reward.tier === "monthly" ? "institution" : "flag"} />
          </span>
          <span className="prg-eyebrow dr-accent">{fresh ? t("dr_boost_unlocked") : t(TIER_LABEL[reward.tier] ?? "dr_tier_weekly")}</span>
          <h2 id="dr-boost-title" className="prg-serif">
            <bdi dir="ltr">+{n(pct)}%</bdi> {t("dr_capital_growth")}
          </h2>
          <p className="prg-muted">
            {fresh ? t("dr_boost_support") : fill(t("dr_earned_on_day"), { day: n(reward.streak_day) })}
          </p>
          {message && <p className="dr-message prg-serif">{message}</p>}
          <button type="button" className="prg-close" onClick={onClose} aria-label={t("close")}>
            ×
          </button>
        </header>

        {done ? (
          <div className="dr-done" role="status">
            <p className="dr-done-line">
              {fill(t("dr_done"), { amount: money(done.capital_added), name: done.portfolio.name })}
            </p>
            <p className="prg-muted">
              {fill(t("dr_done_return"), { ret: percent(done.return_after_pct) })}
            </p>
            <div className="dr-actions">
              <button type="button" className="dr-btn is-primary" onClick={onClose}>
                {t("close")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <fieldset className="dr-portfolios" disabled={busy}>
              <legend>{t("dr_choose_portfolio")}</legend>
              {!portfolios && !error && <p className="prg-muted" role="status">{t("loading")}</p>}
              {portfolios && eligible.length === 0 && <p className="prg-muted">{t("dr_no_portfolio")}</p>}
              {eligible.map((p) => {
                const pv = previewBoost(p.equity, p.capital_base ?? p.starting_balance, pct);
                return (
                  <label key={p.id} className={`dr-portfolio${chosen === p.id ? " is-chosen" : ""}`}>
                    <input type="radio" name="dr-portfolio" checked={chosen === p.id} onChange={() => setChosen(p.id)} />
                    <span className="dr-portfolio-name"><bdi>{p.name}</bdi></span>
                    <dl className="dr-figures">
                      <div>
                        <dt>{t("dr_current_value")}</dt>
                        <dd><bdi dir="ltr">{money(p.equity)}</bdi></dd>
                      </div>
                      <div>
                        <dt>{t("dr_current_return")}</dt>
                        <dd className={p.return_pct >= 0 ? "gain" : "loss"}><bdi dir="ltr">{percent(p.return_pct)}</bdi></dd>
                      </div>
                      <div>
                        <dt>{t("dr_capital_added")}</dt>
                        <dd className="dr-accent"><bdi dir="ltr">+{money(pv.added)}</bdi></dd>
                      </div>
                      <div>
                        <dt>{t("dr_value_after")}</dt>
                        <dd><bdi dir="ltr">{money(pv.after)}</bdi></dd>
                      </div>
                      <div>
                        <dt>{t("dr_return_after")}</dt>
                        <dd className={pv.returnAfter >= 0 ? "gain" : "loss"}><bdi dir="ltr">{percent(pv.returnAfter)}</bdi></dd>
                      </div>
                    </dl>
                  </label>
                );
              })}
            </fieldset>
            <p className="prg-muted prg-small dr-note">{t("dr_not_profit_note")}</p>
            {error && <p className="prg-error" role="alert">{t(error)}</p>}
            <div className="dr-actions">
              <button type="button" className="dr-btn is-primary" onClick={apply} disabled={busy || chosen === null}>
                {t("dr_apply")}
              </button>
              <button type="button" className="dr-btn" onClick={onClose} disabled={busy}>
                {t("dr_claim_later")}
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
};
