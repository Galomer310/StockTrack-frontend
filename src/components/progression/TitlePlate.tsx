import type { CSSProperties } from "react";
import type { Title } from "../../api/progression";
import { useLanguage } from "../../i18n/LanguageContext";
import { categoryName } from "./categories";
import { Emblem } from "./emblems";

/* ===========================================================================
   The active title, as a small framed plate.
   ---------------------------------------------------------------------------
   Category icon, the title in serif, and the category under it in its
   accent colour. Titles are English in both languages, so the name and the
   category are isolated left to right inside a Hebrew line. `key` on the
   name restarts its entrance transition when the title changes.
   =========================================================================== */

export const TitlePlate = ({ title, size = "md" }: { title: Title | null; size?: "md" | "lg" }) => {
  const { t } = useLanguage();
  if (!title) {
    return (
      <div className={`prg-plate prg-plate--${size} is-empty`}>
        <span className="prg-plate-icon" aria-hidden="true">
          <Emblem name="crown" />
        </span>
        <span className="prg-plate-text">
          <span className="prg-plate-name">{t("prg_no_title")}</span>
        </span>
      </div>
    );
  }
  return (
    <div className={`prg-plate prg-plate--${size}`} style={{ "--accent": title.accent_color } as CSSProperties}>
      <span className="prg-plate-icon" aria-hidden="true">
        <Emblem name={title.icon} />
      </span>
      <span className="prg-plate-text">
        <bdi className="prg-plate-name prg-serif" dir="ltr" key={title.id}>
          {title.name}
        </bdi>
        <bdi className="prg-plate-category" dir="ltr">
          {categoryName(title.category)}
        </bdi>
      </span>
    </div>
  );
};
