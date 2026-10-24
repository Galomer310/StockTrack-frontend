import { CSSProperties, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Award, AwardArt as AwardArtName } from "../../api/playerCard";
import { fill } from "../../i18n/fill";
import { useLanguage } from "../../i18n/LanguageContext";
import { RARITY_TEXT } from "../progression/categories";
import { Emblem } from "../progression/emblems";
import { AwardArt } from "./art";
import { formatDate, formatNumber } from "./format";
import { Icon } from "./icons";

/* ===========================================================================
   Areas 3 and 4 - professional medals and game achievements (spec 6, 7).
   ---------------------------------------------------------------------------
   Two separate banks, drawn by the same panel. Each shows up to four of
   the player's own awards, ranked by the server, and only awards actually
   earned. Choosing one opens its details: name, description, how it is
   earned, when, its prestige or importance, and its XP.

   Game achievements are drawn with their category's emblem and colour, and
   the panel leads to the full collection (/player/achievements). Medals keep
   the drawn medal art until the medal bank exists.
   =========================================================================== */

export type AwardKind = "medal" | "achievement";

// A game achievement's emblem in its category colour, or a medal's drawing.
const Art = ({ award, className }: { award: Award; className?: string }) =>
  award.category ? (
    <span
      className={`pc-ach-emblem is-${award.rarity ?? "basic"}${className ? ` ${className}` : ""}`}
      style={{ "--accent": award.accent_color } as CSSProperties}
      aria-hidden="true"
    >
      <Emblem name={award.art} />
    </span>
  ) : (
    <AwardArt art={award.art as AwardArtName} className={className} />
  );

export const AwardsPanel = ({
  kind,
  awards,
  total,
  demo,
  onOpen,
}: {
  kind: AwardKind;
  awards: Award[];
  /** How many the player has in all; the panel shows at most four. */
  total: number;
  /** The demo query value, kept on the link to the collection. */
  demo?: string | null;
  onOpen: (award: Award) => void;
}) => {
  const { t, lang, locale } = useLanguage();
  const isMedal = kind === "medal";
  return (
    <section className="pc-card pc-panel">
      <h2 className="pc-panel-title">
        <Icon name={isMedal ? "laurel" : "trophy"} />
        {t(isMedal ? "medals_title" : "achievements_title")}
        {isMedal && <Icon name="laurel" />}
      </h2>
      {awards.length ? (
        <ul className="pc-awards">
          {awards.slice(0, 4).map((a) => (
            <li key={a.id}>
              <button type="button" className={`pc-award pc-award--${kind}`} onClick={() => onOpen(a)}>
                <Art award={a} />
                <span dir="auto">{a.name[lang]}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="pc-empty">{t(isMedal ? "medals_empty" : "achievements_empty")}</p>
      )}
      {!isMedal && (
        <div className="pc-awards-foot">
          <span>{fill(t("prg_unlocked_n"), { n: new Intl.NumberFormat(locale).format(total) })}</span>
          <Link className="pc-awards-link" to={`/player/achievements${demo != null ? `?demo=${demo}` : ""}`}>
            {t("prg_view_all")}
          </Link>
        </div>
      )}
    </section>
  );
};

export const AwardDialog = ({
  award,
  kind,
  onClose,
}: {
  award: Award | null;
  kind: AwardKind;
  onClose: () => void;
}) => {
  const { t, lang, locale } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (award && !dialog.open) dialog.showModal();
    if (!award && dialog.open) dialog.close();
  }, [award]);

  return (
    <dialog
      ref={ref}
      className="pc-dialog"
      aria-labelledby="pc-dialog-title"
      onClose={onClose}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {award && (
        <div className="pc-dialog-body">
          <span className="pc-dialog-kind">{t(kind === "medal" ? "award_medal" : "award_achievement")}</span>
          <Art award={award} className="pc-dialog-art" />
          <h3 id="pc-dialog-title" dir="auto">{award.name[lang]}</h3>
          <p>{award.description[lang]}</p>
          <dl className="pc-facts">
            <div>
              <dt>{t("award_condition")}</dt>
              <dd>{award.condition[lang]}</dd>
            </div>
            <div>
              <dt>{t("award_earned")}</dt>
              <dd>{formatDate(award.earned_at, locale)}</dd>
            </div>
            <div>
              <dt>{t(kind === "medal" ? "award_prestige" : "award_importance")}</dt>
              <dd>
                {award.rarity ? (
                  t(RARITY_TEXT[award.rarity] ?? "rarity_basic")
                ) : (
                  <bdi dir="ltr">{formatNumber(award.rank, locale)}</bdi>
                )}
              </dd>
            </div>
            <div>
              <dt>XP</dt>
              <dd><bdi dir="ltr">+{formatNumber(award.xp, locale)}</bdi></dd>
            </div>
          </dl>
          <button type="button" className="pc-btn" onClick={onClose} autoFocus>
            {t("close")}
          </button>
        </div>
      )}
    </dialog>
  );
};
