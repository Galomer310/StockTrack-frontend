import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import LegalPage, { LegalSection } from "../legal/LegalPage";
import { ACCESSIBILITY_CONTACT, ACCESSIBILITY_UPDATED, OPERATOR, RESPONSE_DAYS, SITE_NAME } from "../legal/site";

/* ===========================================================================
   Accessibility statement (הצהרת נגישות).
   ---------------------------------------------------------------------------
   Written for the Equal Rights for Persons with Disabilities (Service
   Accessibility Adjustments) Regulations, 2013, regulation 35: the level
   reached and the standard (IS 5568, based on WCAG 2.0 AA; tested against
   WCAG 2.1 AA), what was done, what is known not to be accessible yet, and
   how to reach the accessibility contact. Keep "known limitations" honest:
   it is the part a reader relies on, and the part a regulator checks.
   =========================================================================== */

const Contact = ({ lang }: { lang: "he" | "en" }) => (
  <dl>
    <dt>{lang === "he" ? "שם" : "Name"}</dt>
    <dd>{ACCESSIBILITY_CONTACT.name[lang]}</dd>
    <dt>{lang === "he" ? "דוא״ל" : "Email"}</dt>
    <dd>
      <a href={`mailto:${ACCESSIBILITY_CONTACT.email}`} dir="ltr">{ACCESSIBILITY_CONTACT.email}</a>
    </dd>
    <dt>{lang === "he" ? "טלפון" : "Phone"}</dt>
    <dd>
      <a href={`tel:${ACCESSIBILITY_CONTACT.phone.replace(/[^\d+]/g, "")}`} dir="ltr">{ACCESSIBILITY_CONTACT.phone}</a>
    </dd>
  </dl>
);

const he = (): LegalSection[] => [
  {
    id: "commitment",
    title: "המחויבות שלנו",
    body: (
      <p>
        {SITE_NAME} הוא משחק השקעות וירטואלי (ללא כסף אמיתי), המופעל על ידי {OPERATOR.name.he}. אנחנו רוצים שכל אחד
        יוכל להשתמש בו, כולל אנשים עם מוגבלות, ומשקיעים בהנגשתו כחלק מהפיתוח השוטף ולא כתוספת.
      </p>
    ),
  },
  {
    id: "level",
    title: "רמת הנגישות",
    body: (
      <p>
        האתר הונגש בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013, ולתקן הישראלי{" "}
        <strong>ת״י 5568</strong>, המבוסס על הנחיות <span lang="en">WCAG 2.0</span>, ברמה <strong>AA</strong>. בבדיקות
        אנחנו עובדים מול הנחיות <span lang="en">WCAG 2.1</span> ברמה AA, שמחמירות מעט יותר.
      </p>
    ),
  },
  {
    id: "done",
    title: "מה עשינו באתר",
    body: (
      <ul>
        <li>ניווט מלא באמצעות המקלדת, עם סימון פוקוס ברור על כל רכיב פעיל.</li>
        <li>קישור „דילוג לתוכן הראשי” בתחילת כל עמוד.</li>
        <li>מבנה עמוד תקני: אזור ניווט, אזור תוכן ראשי, כותרות לפי סדר היררכי, וכותרת ייחודית לכל עמוד.</li>
        <li>במעבר בין עמודים, הפוקוס עובר לכותרת העמוד החדש כדי שקוראי מסך יכריזו עליו.</li>
        <li>תוויות גלויות לכל שדות הטפסים, והשלמה אוטומטית לשדות אימייל וסיסמה.</li>
        <li>חלונות קופצים שומרים את הפוקוס בתוכם, נסגרים במקש Esc ומחזירים את הפוקוס למקום שממנו נפתחו.</li>
        <li>ניגודיות צבעים של 4.5:1 לפחות לטקסט, ורווח והפסד מסומנים גם בסימן (+/−) ולא רק בצבע.</li>
        <li>לכל תרשים יש תיאור טקסטואלי לקוראי מסך, ולכל מדד יש הסבר מילולי.</li>
        <li>תמיכה מלאה בעברית (מימין לשמאל) ובאנגלית, עם הגדרת שפה נכונה לכל עמוד.</li>
        <li>כיבוד הגדרת המערכת „הפחתת תנועה”: אנימציות נעצרות למי שביקש זאת.</li>
        <li>התאמה למסכים קטנים ולהגדלת תצוגה עד 200% בלי לאבד תוכן.</li>
      </ul>
    ),
  },
  {
    id: "tested",
    title: "איך בדקנו",
    body: (
      <p>
        האתר נבדק בכלי בדיקה אוטומטי (<span lang="en">axe-core</span>) בכל העמודים ובשתי השפות, ובבדיקה ידנית של ניווט
        במקלדת, בדפדפנים <span lang="en">Chrome</span> ו-<span lang="en">Edge</span> העדכניים. האתר לא משתמש ב„תוסף
        נגישות”: ההתאמות נעשו בקוד האתר עצמו.
      </p>
    ),
  },
  {
    id: "limits",
    title: "מגבלות ידועות",
    body: (
      <>
        <p>למרות מאמצינו, ייתכן שחלקים מסוימים עדיין אינם נגישים במלואם. ידוע לנו על:</p>
        <ul>
          <li>
            התרשימים (שווי תיק, השוואה למדדים, מחירי מניות) מוצגים כתמונה גרפית. לכל תרשים יש תיאור כללי, ורוב הנתונים
            מופיעים גם כטקסט או בטבלה, אך לא כל נקודה בתרשים זמינה כטקסט.
          </li>
          <li>חלק מהאנימציות החגיגיות (מדליות, דרגות) נבדקו בעיקר חזותית.</li>
          <li>טרם הושלמה בדיקה מלאה עם קוראי מסך (<span lang="en">NVDA, VoiceOver</span>).</li>
        </ul>
        <p>אם נתקלתם בקושי, נשמח לשמוע ולתקן, ובינתיים לעזור לכם להשיג את המידע בדרך אחרת.</p>
      </>
    ),
  },
  {
    id: "contact",
    title: "פנייה בנושא נגישות",
    body: (
      <>
        <p>
          נתקלתם בבעיה או שיש לכם הצעה? אנא פנו לרכז/ת הנגישות. כדי שנוכל לטפל במהירות, ציינו את העמוד, מה ניסיתם לעשות
          ובאיזה דפדפן וטכנולוגיה מסייעת השתמשתם. נשיב תוך {RESPONSE_DAYS} ימים לכל היותר.
        </p>
        <Contact lang="he" />
      </>
    ),
  },
  {
    id: "physical",
    title: "הסדרי נגישות פיזיים",
    body: <p>השירות ניתן באינטרנט בלבד, ואין לו משרד או נקודת שירות פיזית לקבלת קהל.</p>,
  },
  {
    id: "more",
    title: "מידע נוסף",
    body: (
      <p>
        על איזה מידע אנחנו שומרים ואיך, ראו את <Link to="/privacy">מדיניות הפרטיות</Link>.
      </p>
    ),
  },
];

const en = (): LegalSection[] => [
  {
    id: "commitment",
    title: "Our commitment",
    body: (
      <p>
        {SITE_NAME} is a virtual investing game (no real money) operated by {OPERATOR.name.en}. We want everyone to be
        able to use it, including people with disabilities, and treat accessibility as part of ongoing development rather
        than an add-on.
      </p>
    ),
  },
  {
    id: "level",
    title: "Accessibility level",
    body: (
      <p>
        The site is made accessible under the Israeli Equal Rights for Persons with Disabilities (Service Accessibility
        Adjustments) Regulations, 2013, and Israeli Standard <strong>IS 5568</strong>, which is based on{" "}
        <strong>WCAG 2.0</strong> at level <strong>AA</strong>. We test against WCAG 2.1 level AA, which is slightly
        stricter.
      </p>
    ),
  },
  {
    id: "done",
    title: "What we have done",
    body: (
      <ul>
        <li>Full keyboard navigation, with a clear focus indicator on every interactive element.</li>
        <li>A "Skip to main content" link at the start of every page.</li>
        <li>Proper page structure: navigation and main landmarks, headings in order, and a distinct title for each page.</li>
        <li>On moving between pages, focus goes to the new page's heading so screen readers announce it.</li>
        <li>Visible labels on every form field, and autocomplete for email and password.</li>
        <li>Pop-up windows keep focus inside, close with Esc, and return focus to where they were opened from.</li>
        <li>Text contrast of at least 4.5:1, and gains and losses marked with a sign (+/−), not by colour alone.</li>
        <li>Every chart has a text description for screen readers, and every metric has a written explanation.</li>
        <li>Full Hebrew (right to left) and English support, with the page language set correctly.</li>
        <li>The system "reduce motion" setting is respected: animations stop for anyone who asked.</li>
        <li>Works on small screens and at 200% zoom without losing content.</li>
      </ul>
    ),
  },
  {
    id: "tested",
    title: "How we tested",
    body: (
      <p>
        Every page was checked in both languages with an automated tool (axe-core), plus manual keyboard testing in
        current Chrome and Edge. The site does not use an "accessibility overlay" widget: the adjustments are in the
        site's own code.
      </p>
    ),
  },
  {
    id: "limits",
    title: "Known limitations",
    body: (
      <>
        <p>Despite our efforts, some parts may not yet be fully accessible. We know of:</p>
        <ul>
          <li>
            Charts (portfolio value, index comparison, share prices) are graphics. Each has a general description and most
            figures also appear as text or in a table, but not every point on a chart is available as text.
          </li>
          <li>Some celebration animations (medals, titles) have mainly been checked visually.</li>
          <li>A full test with screen readers (NVDA, VoiceOver) has not been completed yet.</li>
        </ul>
        <p>If you run into a problem, we want to hear about it and fix it, and meanwhile help you get the information another way.</p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Accessibility contact",
    body: (
      <>
        <p>
          Found a problem or have a suggestion? Please contact our accessibility coordinator. To help us act quickly, tell
          us the page, what you were trying to do, and which browser and assistive technology you used. We reply within{" "}
          {RESPONSE_DAYS} days at most.
        </p>
        <Contact lang="en" />
      </>
    ),
  },
  {
    id: "physical",
    title: "Physical accessibility",
    body: <p>The service is online only and has no office or physical service point.</p>,
  },
  {
    id: "more",
    title: "More information",
    body: (
      <p>
        What information we keep and how: see the <Link to="/privacy">privacy statement</Link>.
      </p>
    ),
  },
];

const AccessibilityStatement = () => {
  const { lang } = useLanguage();
  return (
    <LegalPage
      title={lang === "he" ? "הצהרת נגישות" : "Accessibility statement"}
      updatedLabel={lang === "he" ? "עודכן לאחרונה:" : "Last updated:"}
      updated={ACCESSIBILITY_UPDATED}
      sections={lang === "he" ? he() : en()}
    />
  );
};

export default AccessibilityStatement;
