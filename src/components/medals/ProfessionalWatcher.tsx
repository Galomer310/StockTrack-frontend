import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { acknowledgePro, fetchProNotifications, ProNotifications } from "../../api/professional";
import { fill } from "../../i18n/fill";
import { useLanguage } from "../../i18n/LanguageContext";
import { tierName } from "./format";
import { Medal } from "./Medal";
import "./professional.css";

/* ===========================================================================
   Professional unlocks and medal upgrades, as one notice (spec 37).
   ---------------------------------------------------------------------------
   Achievements are evaluated with the valuation job, so there is nothing to
   ask for after an action: the watcher looks when the app opens and on page
   changes. Several unlocks at once never stack: one notice shows the most
   prestigious medal event (with its upgrade animation) and how many
   achievements arrived, then everything shown is marked as seen.
   =========================================================================== */

export const ProfessionalWatcher = () => {
  const { t, dir, lang } = useLanguage();
  const location = useLocation();
  const [notice, setNotice] = useState<ProNotifications | null>(null);
  const busy = useRef(false);
  // While a notice is open (or being acknowledged), no new check starts:
  // otherwise closing it would fetch the same items back before the
  // acknowledgement lands.
  const holding = useRef(false);

  const check = useCallback(async () => {
    if (busy.current || holding.current) return;
    busy.current = true;
    try {
      const n = await fetchProNotifications();
      if (n.achievements.length || n.medals.length) {
        holding.current = true;
        setNotice(n);
      }
    } catch {
      // Never worth an error on someone else's page; the next page change retries.
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    check();
  }, [location.pathname, check]);

  if (!notice) return null;

  const close = () => {
    setNotice(null);
    acknowledgePro(notice.achievements.map((a) => a.id), notice.medals.map((m) => m.id))
      .catch(() => undefined)
      .finally(() => {
        holding.current = false;
      });
  };
  const medal = notice.medals[0];
  const count = notice.achievements.length;
  const shown = notice.achievements.slice(0, 3);

  return (
    <div className="pro-notice-backdrop" dir={dir} lang={lang} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="pro-notice" role="dialog" aria-modal="true" aria-labelledby="pro-notice-title">
        {medal && (
          <>
            <span className="pro-notice-kicker">{medal.is_upgrade ? t("pro_notice_upgrade") : t("pro_notice_medal")}</span>
            <Medal icon={medal.icon} tier={medal.tier} decoration={medal.decoration} size={132} className="is-upgrading" />
            <h2 id="pro-notice-title" dir="auto">
              {medal.name[lang]}
              {medal.medal_id === "btm_annual" && <bdi> {medal.period_key}</bdi>}
            </h2>
            <span className="pro-tier">{tierName(t, medal.tier, medal.decoration, medal.medal_id)}</span>
          </>
        )}
        {count > 0 && (
          <>
            <p className={medal ? "pro-notice-sub" : "pro-notice-kicker"} id={medal ? undefined : "pro-notice-title"}>
              {count === 1 ? t("pro_notice_achievements_one") : fill(t("pro_notice_achievements_other"), { n: count })}
            </p>
            <ul className="pro-notice-list">
              {shown.map((a) => (
                <li key={a.id} dir="auto">
                  {a.name[lang]}
                  {a.portfolio_name && <span className="pro-record-meta"> · <bdi>{a.portfolio_name}</bdi></span>}
                </li>
              ))}
              {count > shown.length && <li className="pro-note">{fill(t("pro_notice_more"), { n: count - shown.length })}</li>}
            </ul>
          </>
        )}
        <div className="pro-notice-actions">
          <Link className="pro-notice-link" to="/player/medals" onClick={close}>
            {t("pro_view_collection")}
          </Link>
          <button type="button" className="pro-primary" onClick={close} autoFocus>
            {t("pro_continue")}
          </button>
        </div>
      </div>
    </div>
  );
};
