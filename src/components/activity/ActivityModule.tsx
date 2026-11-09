import { useCallback, useEffect, useState } from "react";
import { Composition, fetchComposition } from "../../api/portfolioDashboard";
import { useLanguage } from "../../i18n/LanguageContext";
import { ActivityDialog } from "./ActivityDialog";
import { dayShort, exposure, KIND_LABEL } from "./format";
import "../allocation/allocation.css";
import "./activity.css";

/* ===========================================================================
   Module 2 - Portfolio Activity, compact (spec Part 1).
   ---------------------------------------------------------------------------
   The latest actions, newest first: date, action (Added / Increased /
   Reduced / Removed), ticker, and the holding's exposure before and after.
   "Open activity" expands it into the detailed view and the composition
   table. The portfolio's owner sees everything; what other players may see
   depends on subscriptions, which do not exist yet.
   =========================================================================== */

const SHOWN = 6;

export const ActivityModule = ({ portfolioId, reloadKey = 0 }: { portfolioId: number; reloadKey?: number }) => {
  const { t, locale } = useLanguage();
  const [data, setData] = useState<Composition | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(() => {
    fetchComposition(portfolioId)
      .then((d) => {
        setData(d);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }, [portfolioId]);
  useEffect(load, [load, reloadKey]);

  return (
    <section className="al-module act-module" aria-labelledby="act-title">
      <header className="al-head">
        <div>
          <h3 id="act-title">{t("act_title")}</h3>
          <p className="al-note">{t("act_note")}</p>
        </div>
        <button type="button" className="al-open" onClick={() => setOpen(true)} disabled={!data || data.events.length === 0}>
          {t("act_open")}
        </button>
      </header>

      {failed && <p className="error">{t("ph_load_failed")}</p>}
      {!data && !failed && <p className="stock-panel-loading">{t("loading")}</p>}
      {data && data.events.length === 0 && <p className="stock-empty">{t("ph_empty")}</p>}

      {data && data.events.length > 0 && (
        <div className="al-scroll">
          <table className="act-table">
            <thead>
              <tr>
                <th scope="col">{t("act_date")}</th>
                <th scope="col">{t("act_action")}</th>
                <th scope="col">{t("act_ticker")}</th>
                <th scope="col">{t("act_prev")}</th>
                <th scope="col">{t("act_new")}</th>
              </tr>
            </thead>
            <tbody>
              {data.events.slice(0, SHOWN).map((e) => (
                <tr key={e.trade_id}>
                  <td>{dayShort(e.at, locale)}</td>
                  <td><span className={`act-kind is-${e.kind}`}>{t(KIND_LABEL[e.kind])}</span></td>
                  <th scope="row"><bdi dir="ltr">{e.symbol}</bdi></th>
                  <td className="act-num"><bdi dir="ltr">{exposure(e.before[e.symbol])}</bdi></td>
                  <td className="act-num"><bdi dir="ltr">{exposure(e.after[e.symbol])}</bdi></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && <ActivityDialog open={open} data={data} onClose={() => setOpen(false)} onChanged={load} />}
    </section>
  );
};
