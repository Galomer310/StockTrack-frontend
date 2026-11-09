import { CASH_KEY, Composition } from "../../api/portfolioDashboard";
import { useLanguage } from "../../i18n/LanguageContext";
import { exposure, whenShort } from "./format";

/* ===========================================================================
   The Portfolio Composition Table (spec Part 1, Module 2 View B; also in
   Portfolio History).
   ---------------------------------------------------------------------------
   One row per symbol (and cash), one column per action, NEWEST ON THE LEFT
   as the spec lays it out - so the table keeps that order in Hebrew too.
   Each cell is only the holding's weight at that moment. Two actions on one
   day are two columns, told apart by their time. The ticker column and the
   dates stay in view while the table scrolls.
   =========================================================================== */

export const CompositionMatrix = ({ data }: { data: Composition }) => {
  const { t, lang, locale } = useLanguage();
  const rows = [...data.symbols, CASH_KEY];
  return (
    <div className="ph-matrix-wrap" dir="ltr">
      <table className="ph-matrix">
        <thead>
          <tr>
            <th scope="col" className="ph-sticky"> </th>
            {data.events.map((e) => (
              <th scope="col" key={e.trade_id}>{whenShort(e.at, locale)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s}>
              <th scope="row" className="ph-sticky">{s === CASH_KEY ? <span lang={lang}>{t("al_cash")}</span> : s}</th>
              {data.events.map((e) => (
                <td key={e.trade_id} className={e.symbol === s ? "is-changed" : ""}>{exposure(e.after[s])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
