import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import LegalPage, { LegalSection } from "../legal/LegalPage";
import { MIN_AGE, OPERATOR, PRIVACY_UPDATED, RESPONSE_DAYS, SITE_NAME } from "../legal/site";

/* ===========================================================================
   Privacy statement (מדיניות פרטיות).
   ---------------------------------------------------------------------------
   Written against the Israeli Protection of Privacy Law, 5741-1981, as
   amended (Amendment 13, in force August 2025): what is collected, whether
   it is required, why, who receives it, where it is stored, for how long,
   and the rights of access, correction and deletion.

   It must describe what the code actually does. When a feature starts
   collecting or showing something new (payments, uploads, analytics,
   e-mail notifications), update this page and bump PRIVACY_VERSION in
   src/legal/site.ts. This text is not legal advice; have it reviewed
   before paid tiers or prize competitions launch.
   =========================================================================== */

const Mail = () => (
  <a href={`mailto:${OPERATOR.email}`} dir="ltr">
    {OPERATOR.email}
  </a>
);

const he = (): LegalSection[] => [
  {
    id: "who",
    title: "מי אנחנו",
    body: (
      <p>
        {SITE_NAME} הוא משחק השקעות וירטואלי: תיקים, עסקאות ותשואות באתר הם הדמיה בלבד, ללא כסף אמיתי וללא ייעוץ
        השקעות. האתר מופעל על ידי {OPERATOR.name.he} (״אנחנו״), שהוא האחראי על המידע הנאסף בו. לכל שאלה: <Mail />.
      </p>
    ),
  },
  {
    id: "collect",
    title: "איזה מידע אנחנו אוספים",
    body: (
      <div className="legal-table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">מידע</th>
              <th scope="col">חובה?</th>
              <th scope="col">למה</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>כתובת אימייל וסיסמה (הסיסמה נשמרת רק בגיבוב מוצפן, לא כטקסט)</td>
              <td>כן, לפתיחת חשבון</td>
              <td>זיהוי והתחברות לחשבון</td>
            </tr>
            <tr>
              <td>שם תצוגה</td>
              <td>כן</td>
              <td>הצגתך לשחקנים אחרים (זירה, פיד, כרטיס שחקן)</td>
            </tr>
            <tr>
              <td>שם משתמש, שם פרטי, תיאור קצר ודמות (אווטאר) מתוך מאגר האתר</td>
              <td>לא, לבחירתך</td>
              <td>הפרופיל וכרטיס השחקן</td>
            </tr>
            <tr>
              <td>תיקים, עסקאות מדומות, נימוקים ועדכונים שכתבת, רשימת מעקב</td>
              <td>לא, אבל זה המשחק עצמו</td>
              <td>הפעלת המשחק, חישוב ביצועים, הישגים, מדליות ודירוג</td>
            </tr>
            <tr>
              <td>מעקבים אחרי שחקנים, תגובות וסימוני ״אהבתי״</td>
              <td>לא</td>
              <td>הפיד והקהילה</td>
            </tr>
            <tr>
              <td>נתוני משחק: ניקוד, דרגה, הישגים, ימי כניסה</td>
              <td>נוצר אוטומטית</td>
              <td>התקדמות ותגמולים</td>
            </tr>
            <tr>
              <td>כתובת IP</td>
              <td>נוצר אוטומטית</td>
              <td>הגבלת ניסיונות הרשמה והתחברות למניעת שימוש לרעה. נשמר בזיכרון השרת לזמן קצר ולא במסד הנתונים</td>
            </tr>
          </tbody>
        </table>
        <p>
          איננו אוספים פרטי תשלום, מספרי חשבון בנק, מספר זהות או מיקום, ואין באתר פרסומות, כלי אנליטיקה או מעקב של צד
          שלישי.
        </p>
      </div>
    ),
  },
  {
    id: "public",
    title: "מה גלוי לשחקנים אחרים",
    body: (
      <>
        <p>
          זהו משחק חברתי. <strong>השחקנים האחרים רואים</strong>: שם התצוגה, שם המשתמש, הדמות, התיאור, כרטיס השחקן,
          התיקים והעסקאות שלך (כולל הנימוקים והעדכונים), הישגים ומדליות, הדירוג בזירה, ומי עוקב אחריך ואחרי מי את/ה
          עוקב/ת.
        </p>
        <p>
          <strong>אף אחד אחר לא רואה</strong> את כתובת האימייל או את הסיסמה שלך.
        </p>
      </>
    ),
  },
  {
    id: "storage",
    title: "אחסון בדפדפן (Local Storage)",
    body: (
      <p>
        האתר שומר בדפדפן שלך רק את מה שנדרש לפעולתו: אסימון ההתחברות (כדי שלא תצטרך/י להתחבר בכל רענון), שעת הפעילות
        האחרונה (לניתוק אוטומטי אחרי 15 דקות ללא פעילות), השפה שבחרת והתיק הפעיל. אין שימוש בעוגיות פרסום או מעקב. היציאה
        מהחשבון מוחקת את אסימון ההתחברות.
      </p>
    ),
  },
  {
    id: "share",
    title: "עם מי המידע משותף",
    body: (
      <>
        <p>איננו מוכרים מידע ואיננו מעבירים אותו לצורכי פרסום. המידע מגיע רק לספקים שמפעילים את האתר עבורנו:</p>
        <ul>
          <li>
            <strong lang="en">Render</strong>: אחסון השרת והאתר. כמו כל ספק אחסון, הוא שומר יומני גישה סטנדרטיים
            (הכוללים כתובת IP) לזמן מוגבל.
          </li>
          <li>
            <strong lang="en">Neon</strong>: מסד הנתונים שבו נשמר המידע המפורט למעלה.
          </li>
          <li>
            <strong lang="en">Google Fonts</strong>: הגופנים באתר נטענים משרתי Google, ולכן הדפדפן שלך שולח אליהם את
            כתובת ה-IP שלו.
          </li>
          <li>
            ספק נתוני השוק (<span lang="en">Massive</span>) מקבל מאיתנו רק סימולי מניות, ללא מידע עליך.
          </li>
        </ul>
        <p>
          השרתים של ספקים אלה נמצאים מחוץ לישראל (בארה״ב או באירופה), ולכן המידע מאוחסן מחוץ לישראל. נמסור מידע לרשויות
          רק אם נחויב בכך על פי דין.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "אבטחת מידע",
    body: (
      <p>
        התקשורת עם האתר מוצפנת (<span lang="en">HTTPS</span>), סיסמאות נשמרות רק בגיבוב חד-כיווני, הגישה לנתונים מוגבלת
        לאסימוני התחברות קצרי מועד, וחשבון ללא פעילות מנותק אוטומטית. אף מערכת אינה חסינה לחלוטין; אם יתגלה אירוע אבטחה
        חמור הנוגע למידע שלך, נודיע לך ולרשות להגנת הפרטיות כנדרש בחוק.
      </p>
    ),
  },
  {
    id: "retention",
    title: "כמה זמן נשמר המידע",
    body: (
      <p>
        המידע נשמר כל עוד החשבון קיים. כשמבקשים למחוק חשבון, נמחק אותו ואת כל המידע הקשור אליו תוך {RESPONSE_DAYS} ימים.
        עותקי גיבוי אצל ספק מסד הנתונים נמחקים במחזור הגיבוי הרגיל שלו.
      </p>
    ),
  },
  {
    id: "rights",
    title: "הזכויות שלך",
    body: (
      <>
        <ul>
          <li>
            <strong>עיון</strong>: לקבל את המידע שנשמר עליך.
          </li>
          <li>
            <strong>תיקון</strong>: את רוב פרטי הפרופיל אפשר לשנות בעצמך בכרטיס השחקן; לכל תיקון אחר, פנה/י אלינו.
          </li>
          <li>
            <strong>מחיקה</strong>: למחוק את החשבון וכל המידע שלו.
          </li>
        </ul>
        <p>
          לכל בקשה כתבו ל-<Mail /> מכתובת האימייל של החשבון, ונשיב תוך {RESPONSE_DAYS} ימים. אם לדעתך לא טיפלנו בפנייה
          כראוי, אפשר לפנות לרשות להגנת הפרטיות במשרד המשפטים.
        </p>
      </>
    ),
  },
  {
    id: "age",
    title: "גיל מינימלי",
    body: (
      <p>
        השימוש באתר מיועד לבני {MIN_AGE} ומעלה. אם נודע לנו שנפתח חשבון של מי שצעיר מכך, נמחק אותו.
      </p>
    ),
  },
  {
    id: "changes",
    title: "שינויים במדיניות",
    body: (
      <p>
        אם נשנה את המדיניות באופן מהותי, נעדכן את התאריך בראש העמוד ונודיע על כך באתר. גם הנגישות חשובה לנו: ראו את{" "}
        <Link to="/accessibility">הצהרת הנגישות</Link>.
      </p>
    ),
  },
];

const en = (): LegalSection[] => [
  {
    id: "who",
    title: "Who we are",
    body: (
      <p>
        {SITE_NAME} is a virtual investing game: portfolios, trades and returns on the site are a simulation, with no real
        money and no investment advice. The site is operated by {OPERATOR.name.en} ("we"), who is responsible for the
        information collected on it. Questions: <Mail />.
      </p>
    ),
  },
  {
    id: "collect",
    title: "What we collect",
    body: (
      <div className="legal-table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Information</th>
              <th scope="col">Required?</th>
              <th scope="col">Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Email address and password (the password is stored only as a one-way hash, never as text)</td>
              <td>Yes, to open an account</td>
              <td>Identifying you and signing you in</td>
            </tr>
            <tr>
              <td>Display name</td>
              <td>Yes</td>
              <td>Showing you to other players (Arena, Feed, Player Card)</td>
            </tr>
            <tr>
              <td>Username, first name, short bio, and an avatar from the site's own set</td>
              <td>No, your choice</td>
              <td>Your profile and Player Card</td>
            </tr>
            <tr>
              <td>Portfolios, simulated trades, the reasoning and follow-ups you write, watchlist</td>
              <td>No, but this is the game itself</td>
              <td>Running the game, performance, achievements, medals and rankings</td>
            </tr>
            <tr>
              <td>Players you follow, comments and reactions</td>
              <td>No</td>
              <td>The Feed and community</td>
            </tr>
            <tr>
              <td>Game data: XP, level, achievements, login days</td>
              <td>Created automatically</td>
              <td>Progress and rewards</td>
            </tr>
            <tr>
              <td>IP address</td>
              <td>Created automatically</td>
              <td>Limiting sign-up and sign-in attempts to prevent abuse. Held briefly in server memory, not in the database</td>
            </tr>
          </tbody>
        </table>
        <p>
          We do not collect payment details, bank details, ID numbers or location, and the site has no ads, analytics or
          third-party tracking.
        </p>
      </div>
    ),
  },
  {
    id: "public",
    title: "What other players can see",
    body: (
      <>
        <p>
          This is a social game. <strong>Other players can see</strong>: your display name, username, avatar, bio, Player
          Card, your portfolios and trades (including your reasoning and follow-ups), achievements and medals, Arena
          ranking, and who follows you and whom you follow.
        </p>
        <p>
          <strong>Nobody else can see</strong> your email address or password.
        </p>
      </>
    ),
  },
  {
    id: "storage",
    title: "Browser storage (Local Storage)",
    body: (
      <p>
        The site keeps only what it needs in your browser: your sign-in token (so a refresh does not sign you out), the
        time of your last activity (for the automatic sign-out after 15 idle minutes), your language and your active
        portfolio. There are no advertising or tracking cookies. Signing out deletes the sign-in token.
      </p>
    ),
  },
  {
    id: "share",
    title: "Who receives information",
    body: (
      <>
        <p>We do not sell information or pass it on for advertising. It reaches only the providers that run the site for us:</p>
        <ul>
          <li>
            <strong>Render</strong>: hosting for the server and the site. Like any host, it keeps standard access logs
            (including IP addresses) for a limited time.
          </li>
          <li>
            <strong>Neon</strong>: the database holding the information listed above.
          </li>
          <li>
            <strong>Google Fonts</strong>: the site's fonts load from Google's servers, so your browser sends them its IP
            address.
          </li>
          <li>The market-data provider (Massive) receives only stock symbols from us, nothing about you.</li>
        </ul>
        <p>
          These providers' servers are outside Israel (in the US or Europe), so the information is stored outside Israel. We
          disclose information to authorities only when required by law.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        Traffic to the site is encrypted (HTTPS), passwords are stored only as a one-way hash, access uses short-lived
        sign-in tokens, and idle sessions sign out automatically. No system is perfectly secure; if a serious security
        incident affects your information, we will tell you and the Privacy Protection Authority as the law requires.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <p>
        Information is kept while the account exists. When you ask us to delete your account, we delete it and everything
        linked to it within {RESPONSE_DAYS} days. Backup copies at the database provider are removed in its normal backup
        cycle.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <ul>
          <li>
            <strong>Access</strong>: get a copy of the information we hold about you.
          </li>
          <li>
            <strong>Correction</strong>: most profile details you can change yourself on your Player Card; for anything
            else, contact us.
          </li>
          <li>
            <strong>Deletion</strong>: delete your account and all its information.
          </li>
        </ul>
        <p>
          For any request, write to <Mail /> from your account's email address; we reply within {RESPONSE_DAYS} days. If you
          believe we have not handled it properly, you can contact the Privacy Protection Authority at the Israeli Ministry
          of Justice.
        </p>
      </>
    ),
  },
  {
    id: "age",
    title: "Minimum age",
    body: <p>The site is for people aged {MIN_AGE} and over. If we learn an account belongs to someone younger, we delete it.</p>,
  },
  {
    id: "changes",
    title: "Changes to this statement",
    body: (
      <p>
        If we change this statement materially, we will update the date at the top and say so on the site. Accessibility
        matters to us too: see the <Link to="/accessibility">accessibility statement</Link>.
      </p>
    ),
  },
];

const PrivacyStatement = () => {
  const { lang } = useLanguage();
  return (
    <LegalPage
      title={lang === "he" ? "מדיניות פרטיות" : "Privacy statement"}
      updatedLabel={lang === "he" ? "עודכן לאחרונה:" : "Last updated:"}
      updated={PRIVACY_UPDATED}
      sections={lang === "he" ? he() : en()}
    />
  );
};

export default PrivacyStatement;
