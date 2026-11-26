import { ReactNode } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { HAS_PLACEHOLDERS } from "./site";
import "./legal.css";

/* ===========================================================================
   Shared frame for the accessibility and privacy statements.
   ---------------------------------------------------------------------------
   Plain, readable document layout: one h1, h2 per section, a line length
   that stays comfortable at 200% zoom, and the last-updated date up top.
   =========================================================================== */

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

interface Props {
  title: string;
  updatedLabel: string;
  updated: string;
  intro?: ReactNode;
  sections: LegalSection[];
}

const LegalPage = ({ title, updatedLabel, updated, intro, sections }: Props) => {
  const { dir, lang, locale } = useLanguage();
  const date = new Date(`${updated}T12:00:00`).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="legal" dir={dir} lang={lang}>
      <header className="legal-head">
        <h1>{title}</h1>
        <p className="legal-updated">
          {updatedLabel} <time dateTime={updated}>{date}</time>
        </p>
        {HAS_PLACEHOLDERS && (
          <p className="legal-draft" role="note">
            {lang === "he"
              ? "טיוטה: פרטי הקשר בדף זה עדיין זמניים."
              : "Draft: the contact details on this page are still placeholders."}
          </p>
        )}
        {intro}
      </header>
      {sections.map((s) => (
        <section key={s.id} aria-labelledby={`legal-${s.id}`}>
          <h2 id={`legal-${s.id}`}>{s.title}</h2>
          {s.body}
        </section>
      ))}
    </article>
  );
};

export default LegalPage;
