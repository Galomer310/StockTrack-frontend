import { CSSProperties, useEffect, useRef, useState } from "react";
import type { Ceremony, Title } from "../../api/progression";
import { fill } from "../../i18n/fill";
import { useLanguage } from "../../i18n/LanguageContext";
import { categoryName } from "./categories";
import { Crest, Emblem } from "./emblems";

/* ===========================================================================
   The title unlock ceremony (Player Title spec 7).
   ---------------------------------------------------------------------------
   A quiet, framed moment rather than a celebration: crest, heading, and the
   tier's three titles as cards that appear one after another. Choosing one
   makes it the active title; "Keep My Current Title" leaves the active title
   as it is. Either way all three stay in the collection, and the server
   marks the ceremony seen so it does not return on refresh.
   =========================================================================== */

export const TitleCeremony = ({
  ceremony,
  hasActiveTitle,
  onChoose,
  onKeep,
}: {
  ceremony: Ceremony | null;
  hasActiveTitle: boolean;
  /** Resolves once the choice is saved; rejects to keep the dialog open. */
  onChoose: (title: Title) => Promise<void>;
  onKeep: () => void;
}) => {
  const { t, dir, lang } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (ceremony && !dialog.open) dialog.showModal();
    if (!ceremony && dialog.open) dialog.close();
    setFailed(false);
  }, [ceremony]);

  const choose = async (title: Title) => {
    setSaving(title.id);
    setFailed(false);
    try {
      await onChoose(title);
    } catch {
      setFailed(true);
    } finally {
      setSaving(null);
    }
  };

  const earlier = ceremony ? ceremony.pending_tiers.length - 1 : 0;

  return (
    <dialog
      ref={ref}
      className="prg prg-dialog prg-ceremony"
      dir={dir}
      lang={lang}
      aria-labelledby="prg-ceremony-title"
      aria-describedby="prg-ceremony-body"
      // Escape is the same as keeping the current title: nothing is lost.
      onCancel={(e) => {
        e.preventDefault();
        if (!saving) onKeep();
      }}
    >
      {ceremony && (
        <div className="prg-dialog-frame prg-ceremony-frame">
          <Crest className="prg-crest">
            <span className="prg-crest-star" aria-hidden="true">✦</span>
          </Crest>
          <span className="prg-eyebrow">{t("prg_ceremony_eyebrow")}</span>
          {/* Focus starts here, not on the first card, so no title looks pre-chosen. */}
          <h2 id="prg-ceremony-title" className="prg-serif prg-ceremony-heading" tabIndex={-1} autoFocus>
            {t("prg_ceremony_title")}
          </h2>
          <p id="prg-ceremony-body" className="prg-muted">{t("prg_ceremony_body")}</p>

          <ul className="prg-ceremony-cards">
            {ceremony.titles.map((title, i) => (
              <li key={title.id} style={{ "--accent": title.accent_color, "--i": i } as CSSProperties}>
                <button
                  type="button"
                  className="prg-ceremony-card"
                  onClick={() => choose(title)}
                  disabled={saving !== null}
                  aria-label={fill(t("prg_choose_named"), { title: title.name })}
                >
                  <Crest className="prg-card-crest">
                    <Emblem name={title.icon} />
                  </Crest>
                  <bdi className="prg-card-category" dir="ltr">{categoryName(title.category)}</bdi>
                  <bdi className="prg-card-title prg-serif" dir="ltr">{title.name}</bdi>
                  <span className="prg-card-action">{saving === title.id ? t("loading") : t("prg_select")}</span>
                </button>
              </li>
            ))}
          </ul>

          {earlier > 0 && (
            <p className="prg-muted prg-small">
              {earlier === 1 ? t("prg_ceremony_earlier_one") : fill(t("prg_ceremony_earlier_many"), { n: earlier })}
            </p>
          )}
          {failed && <p className="prg-error" role="alert">{t("prg_title_save_failed")}</p>}

          <button type="button" className="prg-quiet" onClick={onKeep} disabled={saving !== null}>
            {t(hasActiveTitle ? "prg_keep_current" : "prg_choose_later")}
          </button>
        </div>
      )}
    </dialog>
  );
};
