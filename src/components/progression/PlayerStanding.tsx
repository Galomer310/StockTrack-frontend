import type { CSSProperties } from "react";
import type { PlayerCardData } from "../../api/playerCard";
import { fill } from "../../i18n/fill";
import { useLanguage } from "../../i18n/LanguageContext";
import { formatNumber } from "../playerCard/format";
import { reasonKey } from "../playerCard/reasons";
import { Emblem } from "./emblems";

/* ===========================================================================
   Level and active title, as two quiet chips under the player's name
   (redesign 2026-11). The title chip carries its path's colour, a tint
   rather than a frame; the link beside them opens the title collection.
   Read from the same progression value as the progress panel, so the two
   can never disagree.
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
  if (!p) {
    return <span className="pc-chip pc-chip--muted">{t(reasonKey(progression) ?? "unavailable_missing")}</span>;
  }
  const title = p.active_title;
  return (
    <div className="pc-chips">
      <span className="pc-chip">{fill(t("prg_level_n"), { n: formatNumber(p.level, locale) })}</span>
      {title && (
        <span className="pc-chip pc-chip--path" style={{ "--path": title.accent_color } as CSSProperties}>
          <Emblem name={title.icon} />
          <bdi dir="ltr">{title.name}</bdi>
        </span>
      )}
      <button type="button" className="pc-chip-link" onClick={onOpenCollection}>
        {t(title ? "prg_my_titles" : "prg_choose_title")}
      </button>
    </div>
  );
};
