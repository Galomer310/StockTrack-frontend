import { useState } from "react";
import { addFollowup, CASH_KEY, Composition, CompositionEvent } from "../../api/portfolioDashboard";
import { money } from "../../api/social";
import { CATEGORICAL, NEUTRAL } from "../../charts/chartTheme";
import { fill } from "../../i18n/fill";
import { useLanguage } from "../../i18n/LanguageContext";
import { MessageKey } from "../../i18n/messages";

/* ===========================================================================
   Portfolio Activity, design B: a decision journal (approved 2026-11).
   ---------------------------------------------------------------------------
   A short summary on top, then the actions grouped by day, newest first.
   Each action is a card: what was done to which holding, when and at what
   price, the weight before and after drawn as one bar, and the reasoning
   written with it, quoted. The reasoning is never rewritten; its author
   adds dated follow-ups underneath.

   The approved design also judges each decision against the market since
   it was made ("vs S&P since"). That needs a metric the server does not
   compute yet (open item), so the card leaves it out rather than guess.

   JournalFlow is the second view: the composition after every action as a
   100% bar, the holding that changed outlined.
   =========================================================================== */

const MAX_FOLLOWUP = 2000;
const ERROR_TEXT: Record<string, MessageKey> = {
  FOLLOWUP_EMPTY: "act_err_empty",
  FOLLOWUP_TOO_LONG: "act_err_long",
  TRADE_NOT_FOUND: "act_err_not_found",
};
const NOUN: Record<CompositionEvent["kind"], MessageKey> = {
  added: "act_noun_added",
  increased: "act_noun_increased",
  reduced: "act_noun_reduced",
  removed: "act_noun_removed",
};
// Arrow up for money going in, down for money coming out.
const KIND_PATH: Record<CompositionEvent["kind"], string> = {
  added: "M12 5v14M5 12h14",
  increased: "M12 19V5M6 11l6-6 6 6",
  reduced: "M12 5v14M6 13l6 6 6-6",
  removed: "M5 12h14",
};

const pct = (w: number | undefined) => Math.round((w ?? 0) * 1000) / 10;
const dayKey = (at: string) => new Date(at).toDateString();

export const JournalSummary = ({ data }: { data: Composition }) => {
  const { t, locale } = useLanguage();
  const n = (v: number) => new Intl.NumberFormat(locale).format(v);
  const buys = data.events.filter((e) => e.action === "buy").length;
  const last = data.events[0];
  const days = last ? Math.max(0, Math.floor((Date.now() - new Date(last.at).getTime()) / 86400000)) : 0;
  return (
    <div className="jr-hero">
      <div className="jr-big">
        <bdi dir="ltr">{n(data.events.length)}</bdi>
      </div>
      <div className="jr-lbl">{t("act_decisions")}</div>
      <div className="jr-stats">
        <span>{fill(t("act_n_buys"), { n: n(buys) })}</span>
        <span>{fill(t("act_n_sells"), { n: n(data.events.length - buys) })}</span>
        {last && <span>{days === 0 ? t("act_last_today") : fill(t("act_last_days"), { n: n(days) })}</span>}
      </div>
    </div>
  );
};

const JournalCard = ({ e, onAdded, canWrite }: { e: CompositionEvent; onAdded: () => void; canWrite: boolean }) => {
  const { t, locale } = useLanguage();
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<MessageKey | null>(null);
  const before = pct(e.before[e.symbol]);
  const after = pct(e.after[e.symbol]);
  const lo = Math.min(before, after);
  const up = after > before;
  const time = new Date(e.at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const stamp = (at: string) => new Date(at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });

  const post = async () => {
    setBusy(true);
    setError(null);
    try {
      await addFollowup(e.trade_id, draft);
      setDraft("");
      setWriting(false);
      onAdded();
    } catch (err) {
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code ?? "";
      setError(ERROR_TEXT[code] ?? "act_err_failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="jc">
      <span className="jc-tk" aria-hidden="true">{e.symbol}</span>
      <h3>
        <span className={`jc-act is-${e.action}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={KIND_PATH[e.kind]} /></svg>
          {t(NOUN[e.kind])}
        </span>
        <span className="jc-sep">·</span>
        <bdi dir="ltr">{e.symbol}</bdi>
      </h3>
      <div className="jc-meta">
        <bdi dir="ltr">{time}</bdi> · {t(e.action === "buy" ? "act_buy_price" : "act_sell_price")} <bdi dir="ltr">{money(e.price)}</bdi>
      </div>
      <div className="jc-wt">
        <div className="jc-bar" aria-hidden="true">
          <i style={{ inlineSize: `${lo}%` }} />
          <i className={`d ${up ? "up" : "down"}`} style={{ insetInlineStart: `${lo}%`, inlineSize: `${Math.abs(after - before)}%` }} />
        </div>
        <span className="jc-n">
          <bdi dir="ltr">
            <span className="jc-quiet">{before}%</span> → <b>{after}%</b>
          </bdi>
        </span>
        <span className="jc-quiet jc-small">{t("act_of_portfolio")}</span>
      </div>
      {e.note ? (
        <p className="jc-why" dir="auto">{e.note}</p>
      ) : (
        <p className="jc-why is-empty">{t("act_no_reason")}</p>
      )}
      {e.followups.map((f) => (
        <div className="jc-upd" key={f.id}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4v7a4 4 0 0 0 4 4h10M15 11l4 4-4 4" /></svg>
          <span>
            <b>{t("act_followup")} · <time dateTime={f.created_at}>{stamp(f.created_at)}</time></b>{" "}
            <span dir="auto">{f.body}</span>
          </span>
        </div>
      ))}
      {canWrite &&
        (writing ? (
          <div className="act-write jc-write">
            <textarea
              dir="auto"
              value={draft}
              maxLength={MAX_FOLLOWUP}
              placeholder={t("act_followup_placeholder")}
              aria-label={t("act_add_followup")}
              onChange={(ev) => setDraft(ev.target.value)}
              autoFocus
            />
            <div className="act-write-actions">
              <button type="button" className="al-open" onClick={post} disabled={busy || !draft.trim()}>
                {t("act_post")}
              </button>
              <button type="button" className="link-btn" onClick={() => setWriting(false)} disabled={busy}>
                {t("cancel")}
              </button>
              <span className="act-hint">{t("act_followup_hint")}</span>
            </div>
            {error && <p className="error" role="alert">{t(error)}</p>}
          </div>
        ) : (
          <button type="button" className="link-btn act-add jc-add" onClick={() => setWriting(true)}>
            + {t("act_add_followup")}
          </button>
        ))}
    </article>
  );
};

export const Journal = ({ data, onChanged, canWrite = true }: { data: Composition; onChanged: () => void; canWrite?: boolean }) => {
  const { locale } = useLanguage();
  const days: { key: string; at: string; list: CompositionEvent[] }[] = [];
  for (const e of data.events) {
    const last = days[days.length - 1];
    if (last && last.key === dayKey(e.at)) last.list.push(e);
    else days.push({ key: dayKey(e.at), at: e.at, list: [e] });
  }
  return (
    <div className="jr">
      {days.map((d) => (
        <section className="jr-day" key={d.key}>
          <div className="jr-date">
            <b>{new Date(d.at).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}</b>
            <span>{new Date(d.at).toLocaleDateString(locale, { weekday: "long" })}</span>
          </div>
          {d.list.map((e) => (
            <JournalCard key={e.trade_id} e={e} onAdded={onChanged} canWrite={canWrite} />
          ))}
        </section>
      ))}
    </div>
  );
};

export const JournalFlow = ({ data }: { data: Composition }) => {
  const { t, lang, locale } = useLanguage();
  const color = (s: string) =>
    s === CASH_KEY ? NEUTRAL.dark : CATEGORICAL.dark[Math.max(0, data.symbols.indexOf(s)) % CATEGORICAL.dark.length];
  const rows = [...data.symbols, CASH_KEY];
  const name = (s: string) => (s === CASH_KEY ? t("al_cash") : s);
  const bar = (w: Record<string, number>, changed: string, start = false) => (
    <div className={`flow-bar${start ? " is-start" : ""}`} dir="ltr">
      {rows
        .filter((s) => (w[s] ?? 0) > 0.0005)
        .map((s) => {
          const p = pct(w[s]);
          return (
            <span
              key={s}
              className={`${s === changed ? "is-changed " : ""}${s === CASH_KEY ? "is-cash" : ""}`}
              style={{ inlineSize: `${p}%`, background: color(s) }}
              title={`${name(s)} ${p}%`}
            >
              {p >= 10 ? `${s === CASH_KEY ? "$" : s}${p >= 20 ? ` ${p}%` : ""}` : ""}
            </span>
          );
        })}
    </div>
  );
  const oldest = data.events[data.events.length - 1];
  return (
    <div className="flow-wrap">
      <div className="flow-legend">
        {rows.map((s) => (
          <span key={s} lang={s === CASH_KEY ? lang : undefined}>
            <i style={{ background: color(s) }} />
            {name(s)}
          </span>
        ))}
      </div>
      <div className="flow">
        {data.events.map((e) => (
          <div className="flow-row" key={e.trade_id}>
            <div className="flow-lbl">
              <b>{new Date(e.at).toLocaleDateString(locale, { day: "numeric", month: "short" })}</b>
              <small>
                {t(NOUN[e.kind])} · <bdi dir="ltr">{e.symbol}</bdi>
              </small>
            </div>
            {bar(e.after, e.symbol)}
          </div>
        ))}
        {oldest && (
          <div className="flow-row">
            <div className="flow-lbl">
              <b>{t("act_start_point")}</b>
              <small>{t("act_before_actions")}</small>
            </div>
            {bar(oldest.before, "", true)}
          </div>
        )}
      </div>
      <p className="jr-how">{t("act_flow_how")}</p>
    </div>
  );
};
