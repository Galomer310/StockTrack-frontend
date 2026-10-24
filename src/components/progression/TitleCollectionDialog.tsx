import { CSSProperties, useEffect, useRef, useState } from "react";
import { fetchTitles, OwnedTitle, setActiveTitle, TitleCollection, TitleNotOwnedError } from "../../api/progression";
import type { DemoScenario } from "../../features/playerCard/demoData";
import { fill, ltr } from "../../i18n/fill";
import { useLanguage } from "../../i18n/LanguageContext";
import { MessageKey } from "../../i18n/messages";
import { TITLE_CATEGORIES } from "./categories";
import { Emblem } from "./emblems";

/* ===========================================================================
   My Title Collection (Player Title spec 9).
   ---------------------------------------------------------------------------
   One tab per category. Every title is listed: unlocked ones can be worn at
   once, locked ones stay visible, muted, with the level that opens them.
   Choosing a title saves it on the server, which checks ownership again, and
   the card updates from the server's answer. Special and store titles
   (future) appear in a section of their own once the player owns any.
   =========================================================================== */

const LEVELS_PER_TIER = 5;

export const TitleCollectionDialog = ({
  open,
  scenario,
  onClose,
  onChanged,
}: {
  open: boolean;
  scenario?: DemoScenario;
  onClose: () => void;
  /** After a title is chosen, with the collection as it now stands. */
  onChanged: (collection: TitleCollection) => void;
}) => {
  const { t, dir, lang, locale } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState<TitleCollection | null>(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<string>(TITLE_CATEGORIES[0].id);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<MessageKey | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let live = true;
    setFailed(false);
    setError(null);
    fetchTitles(scenario)
      .then((d) => {
        if (!live) return;
        setData(d);
        // Open on the category of the title being worn.
        const activeCategory = d.titles.find((x) => x.id === d.active_title_id)?.category;
        if (activeCategory && TITLE_CATEGORIES.some((c) => c.id === activeCategory)) setTab(activeCategory);
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [open, scenario]);

  const choose = async (title: OwnedTitle) => {
    if (!title.unlocked || saving || data?.active_title_id === title.id) return;
    setSaving(title.id);
    setError(null);
    try {
      const next = await setActiveTitle(title.id, scenario);
      setData(next);
      onChanged(next);
    } catch (err) {
      setError(err instanceof TitleNotOwnedError ? "prg_title_locked_error" : "prg_title_save_failed");
    } finally {
      setSaving(null);
    }
  };

  const levelTitles = (category: string) => data?.titles.filter((x) => x.source_type === "level" && x.category === category) ?? [];
  const special = data?.titles.filter((x) => x.source_type !== "level") ?? [];
  const n = (v: number) => new Intl.NumberFormat(locale).format(v);

  const row = (title: OwnedTitle) => {
    const active = data?.active_title_id === title.id;
    const from = title.required_level;
    return (
      <li key={title.id}>
        <button
          type="button"
          className={`prg-title-row${active ? " is-active" : ""}${title.unlocked ? "" : " is-locked"}`}
          style={{ "--accent": title.accent_color } as CSSProperties}
          onClick={() => choose(title)}
          disabled={!title.unlocked || saving !== null}
          aria-pressed={title.unlocked ? active : undefined}
        >
          <span className="prg-title-row-icon" aria-hidden="true">
            <Emblem name={title.unlocked ? title.icon : "lock"} />
          </span>
          <span className="prg-title-row-main">
            <bdi className="prg-title-row-name prg-serif" dir="ltr">{title.name}</bdi>
            {from !== null && (
              <span className="prg-title-row-range">
                {fill(t("prg_levels_range"), {
                  // Isolated in Hebrew, or "1–5" reads as "5–1".
                  range: lang === "he" ? ltr(`${n(from)}–${n(from + LEVELS_PER_TIER - 1)}`) : `${n(from)}–${n(from + LEVELS_PER_TIER - 1)}`,
                })}
              </span>
            )}
          </span>
          <span className="prg-title-row-state">
            {active ? (
              <span className="prg-chip is-active">
                <Emblem name="check" />
                {t("prg_active")}
              </span>
            ) : title.unlocked ? (
              <span className="prg-chip">{saving === title.id ? t("loading") : t("prg_select")}</span>
            ) : (
              <span className="prg-chip is-locked">
                {from !== null ? fill(t("prg_level_n"), { n: n(from) }) : t("prg_locked")}
              </span>
            )}
          </span>
        </button>
      </li>
    );
  };

  const current = TITLE_CATEGORIES.find((c) => c.id === tab)!;
  const list = levelTitles(tab);

  return (
    <dialog
      ref={ref}
      className="prg prg-dialog prg-collection"
      dir={dir}
      lang={lang}
      aria-labelledby="prg-collection-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="prg-dialog-frame">
        <header className="prg-dialog-head">
          <span className="prg-eyebrow">{data ? fill(t("prg_level_n"), { n: n(data.level) }) : " "}</span>
          <h2 id="prg-collection-title" className="prg-serif">{t("prg_my_titles")}</h2>
          <p className="prg-muted">{t("prg_collection_intro")}</p>
          <button type="button" className="prg-close" onClick={onClose} aria-label={t("close")}>
            ×
          </button>
        </header>

        {failed && <p className="prg-error" role="alert">{t("load_failed")}</p>}
        {!data && !failed && <p className="prg-muted prg-center" role="status">{t("loading")}</p>}

        {data && (
          <>
            <div className="prg-tabs" role="tablist" aria-label={t("prg_my_titles")}>
              {TITLE_CATEGORIES.map((c) => {
                const owned = levelTitles(c.id).filter((x) => x.unlocked).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    id={`prg-tab-${c.id}`}
                    aria-selected={tab === c.id}
                    aria-controls="prg-tab-panel"
                    className={`prg-tab${tab === c.id ? " is-selected" : ""}`}
                    style={{ "--accent": c.accent } as CSSProperties}
                    onClick={() => setTab(c.id)}
                  >
                    <Emblem name={c.icon} />
                    <span className="prg-tab-text">
                      <bdi dir="ltr" className="prg-tab-name">{c.name}</bdi>
                      <span className="prg-tab-count">
                        {fill(t("prg_unlocked_count"), { n: n(owned), total: n(levelTitles(c.id).length) })}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div id="prg-tab-panel" role="tabpanel" aria-labelledby={`prg-tab-${tab}`} className="prg-tab-panel">
              <p className="prg-tagline" style={{ "--accent": current.accent } as CSSProperties}>
                {t(current.tagline)}
              </p>
              <ul className="prg-title-list">{list.map(row)}</ul>
            </div>

            {special.length > 0 && (
              <section className="prg-special">
                <h3 className="prg-eyebrow">{t("prg_special_titles")}</h3>
                <ul className="prg-title-list">{special.map(row)}</ul>
              </section>
            )}

            {error && <p className="prg-error" role="alert">{t(error)}</p>}
          </>
        )}
      </div>
    </dialog>
  );
};
