import type { PlayerCardData } from "../../api/playerCard";
import { useLanguage } from "../../i18n/LanguageContext";
import { formatNumber } from "../playerCard/format";
import { reasonKey } from "../playerCard/reasons";
import { Emblem, Ornament } from "./emblems";
import { TitlePlate } from "./TitlePlate";

/* ===========================================================================
   Level, then the active title directly beneath it (Player Title spec 8).
   ---------------------------------------------------------------------------
   INVESTOR LEVEL, the number, a gold ornament, the title plate with its
   category, and the way into the title collection. Takes the place of the
   header's old level and title badges, from the same progression value the
   progress panel reads, so the two can never disagree.
   =========================================================================== */

export const PlayerStanding = ({
  progression,
  onOpenCollection,
}: {
  progression: PlayerCardData["progression"];
  onOpenCollection: () => void;
}) => {
  const { t, locale } = useLanguage();
  const p = progression.state === "available" ? progression.value : null;
  return (
    <div className="prg prg-standing">
      <span className="prg-eyebrow">{t("prg_investor_level")}</span>
      {p ? (
        <span className="prg-level prg-serif">
          <bdi>{formatNumber(p.level, locale)}</bdi>
        </span>
      ) : (
        <span className="prg-level-missing">{t(reasonKey(progression) ?? "unavailable_missing")}</span>
      )}
      <Ornament className="prg-ornament" />
      {p && (
        <>
          <TitlePlate title={p.active_title} />
          <button type="button" className="prg-link" onClick={onOpenCollection}>
            <Emblem name="crown" />
            {t(p.active_title ? "prg_my_titles" : "prg_choose_title")}
          </button>
        </>
      )}
    </div>
  );
};
