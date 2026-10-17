/* ===========================================================================
   Interface copy, in both languages.
   ---------------------------------------------------------------------------
   The app is switchable between Hebrew and English. Every string a
   translated screen shows lives here; English defines the keys, and the
   Hebrew table is typed against it, so a key added to one and not the other
   fails the build instead of rendering blank.

   Translated so far: the navbar and the Player Card. Other screens move here
   as they are ported to right-to-left.
   =========================================================================== */

export type Lang = "he" | "en";

const en = {
  // Navbar
  nav_home: "Home",
  nav_dashboard: "Dashboard",
  nav_player_card: "Player Card",
  nav_search: "Search Stocks",
  nav_market: "Market",
  nav_feed: "Feed",
  nav_leaderboard: "Leaderboard",
  nav_light_mode: "Light Mode",
  nav_dark_mode: "Dark Mode",
  nav_logout: "Logout",
  nav_open_menu: "Open menu",
  nav_close_menu: "Close menu",
  nav_switch_language: "עברית",
  nav_switch_language_label: "Switch to Hebrew",

  // Shared
  info: "More information",
  close: "Close",
  save: "Save",
  cancel: "Cancel",
  loading: "Loading…",
  load_failed: "The Player Card could not be loaded. Refresh the page to try again.",
  demo_notice: "Showing demo data. Real values appear once the player endpoints are live.",
  level: "Level",

  // Page
  pc_title: "Player Card",

  // Header
  bio_title: "Player Description",
  bio_edit: "Edit",
  bio_save_failed: "Your changes could not be saved. Try again.",
  first_name_label: "First name (optional)",
  err_bio_too_long: "The description can be at most 100 characters.",
  err_first_name_too_long: "The first name can be at most 50 characters.",
  err_invalid_characters: "Remove line breaks and special control characters, then save again.",
  err_not_editable: "That detail can't be changed here.",
  avatar_label: "Profile picture",

  // Six stats
  s_avg: "Avg. Return, Active Portfolios",
  s_achievements: "Game Achievements",
  s_medals: "Professional Medals",
  s_subscribers: "Subscribers",
  s_followers: "Followers",
  s_best: "Best Portfolio Gain",
  t_avg: "A simple average of each active portfolio's return since it opened. Every portfolio counts equally; closed ones are left out.",
  t_achievements: "Game achievements earned from competitions, missions, challenges and activity.",
  t_medals: "Professional medals are awarded for investing milestones, separately from game achievements.",
  t_subscribers: "Active paid subscribers ($3 a month). Subscribers can see this player's portfolios and holdings.",
  t_followers: "People who follow this player for free. Following does not reveal holdings.",
  t_best: "The cumulative return of the best-performing active portfolio.",

  // Lock and missing states
  lock_min_active: "Unlocks with 2 active portfolios",
  lock_top_threshold: "Unlocks when an active portfolio passes 20%",
  unavailable_missing: "Not available yet",
  unavailable_none: "No active portfolios",
  unavailable_not_defined: "Not defined yet",
  nickname_missing: "No nickname yet",

  // Awards
  medals_title: "Professional Medals",
  achievements_title: "Game Achievements",
  medals_empty: "No professional medals yet",
  achievements_empty: "No achievements yet",
  award_medal: "Professional medal",
  award_achievement: "Game achievement",
  award_condition: "How to earn it",
  award_earned: "Earned",
  award_prestige: "Prestige",
  award_importance: "Importance",

  // Competitions
  competitions_title: "Competitions",
  c_entered: "Entered",
  c_prizes: "Prize wins",
  c_top3: "Top 3",
  c_first: "1st place",
  tc_entered: "Competitions entered. Each one counts once.",
  tc_prizes: "Competitions where a prize was won, which is not always a top-3 finish. Counted once results are confirmed.",
  tc_top3: "Competitions finished in the top 3, first place included. Counted once results are confirmed.",
  tc_first: "Competitions finished in first place. Counted once results are confirmed.",

  // Performance
  performance_title: "Player Performance",
  p_total: "Total portfolios",
  p_active: "Active portfolios",
  p_avg: "Average return",
  p_month: "Avg. monthly return",
  p_top_name: "Top portfolio",
  p_top_return: "Top portfolio return",
  tp_total: "Every portfolio opened, closed ones included.",
  tp_active: "Portfolios that are active right now.",
  tp_month: "Average return of the active portfolios since the start of this month, Israel time.",
  tp_top: "The active portfolio with the highest cumulative return, once it is above 20%.",

  // Progression
  progress_title: "Game Progress",
  next_goal: "Next goal",
  next_title: "Next title",
  t_progress: "Level rises with XP earned from performance, activity, medals and achievements.",
};

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;

const he: Messages = {
  nav_home: "בית",
  nav_dashboard: "לוח בקרה",
  nav_player_card: "כרטיס שחקן",
  nav_search: "חיפוש מניות",
  nav_market: "שוק",
  nav_feed: "פיד",
  nav_leaderboard: "טבלת דירוג",
  nav_light_mode: "מצב בהיר",
  nav_dark_mode: "מצב כהה",
  nav_logout: "התנתקות",
  nav_open_menu: "פתיחת תפריט",
  nav_close_menu: "סגירת תפריט",
  nav_switch_language: "English",
  nav_switch_language_label: "מעבר לאנגלית",

  info: "מידע נוסף",
  close: "סגירה",
  save: "שמירה",
  cancel: "ביטול",
  loading: "טוען…",
  load_failed: "לא ניתן היה לטעון את כרטיס השחקן. רעננו את העמוד כדי לנסות שוב.",
  demo_notice: "מוצגים נתוני הדגמה. הנתונים האמיתיים יופיעו כשממשקי השחקן יהיו זמינים.",
  level: "Level",

  pc_title: "כרטיס שחקן",

  bio_title: "תיאור השחקן",
  bio_edit: "עריכה",
  bio_save_failed: "לא ניתן היה לשמור את השינויים. נסו שוב.",
  first_name_label: "שם פרטי (לא חובה)",
  err_bio_too_long: "התיאור יכול להכיל עד 100 תווים.",
  err_first_name_too_long: "השם הפרטי יכול להכיל עד 50 תווים.",
  err_invalid_characters: "הסירו ירידות שורה ותווים מיוחדים ושמרו שוב.",
  err_not_editable: "לא ניתן לשנות את הפרט הזה כאן.",
  avatar_label: "תמונת פרופיל",

  s_avg: "תשואה ממוצעת של התיקים הפעילים",
  s_achievements: "הישגים במשחק",
  s_medals: "מדליות מקצועיות",
  s_subscribers: "מנויים",
  s_followers: "עוקבים",
  s_best: "Best Portfolio Gain",
  t_avg: "ממוצע פשוט של התשואה של כל תיק פעיל, ממועד פתיחתו ועד היום. לכל תיק משקל שווה; תיקים סגורים לא נכללים.",
  t_achievements: "הישגים שנצברו במשחק: תחרויות, משימות, אתגרים ופעילות.",
  t_medals: "מדליות מקצועיות מוענקות על השגת יעדים בתחום ההשקעות, בנפרד מהישגי המשחק.",
  t_subscribers: "מנויים משלמים פעילים ($3 לחודש). מנוי רואה את התיקים ואת מבנה האחזקות של השחקן.",
  t_followers: "משתמשים שעוקבים אחרי השחקן בחינם. מעקב אינו חושף את מבנה האחזקות.",
  t_best: "התשואה המצטברת של התיק הפעיל המוביל.",

  lock_min_active: "נפתח מ־2 תיקים פעילים",
  lock_top_threshold: "נפתח כשתיק פעיל עובר 20%",
  unavailable_missing: "עדיין לא זמין",
  unavailable_none: "אין תיקים פעילים",
  unavailable_not_defined: "עדיין לא הוגדר",
  nickname_missing: "עדיין אין כינוי",

  medals_title: "מדליות מקצועיות",
  achievements_title: "הישגים במשחק",
  medals_empty: "עוד לא הוענקו מדליות מקצועיות",
  achievements_empty: "עוד אין הישגים",
  award_medal: "מדליה מקצועית",
  award_achievement: "הישג במשחק",
  award_condition: "תנאי קבלה",
  award_earned: "הושג",
  award_prestige: "רמת יוקרה",
  award_importance: "רמת חשיבות",

  competitions_title: "השתתפות בתחרויות",
  c_entered: "השתתפויות",
  c_prizes: "זכיות",
  c_top3: "Top 3",
  c_first: "מקום 1",
  tc_entered: "מספר התחרויות שבהן השתתף השחקן. כל תחרות נספרת פעם אחת.",
  tc_prizes: "תחרויות שבהן זכה השחקן בפרס. זכייה אינה בהכרח מקום בשלישייה הראשונה. נספר לאחר אישור התוצאות.",
  tc_top3: "תחרויות שהסתיימו באחד משלושת המקומות הראשונים, כולל מקום ראשון. נספר לאחר אישור התוצאות.",
  tc_first: "תחרויות שהסתיימו במקום הראשון. נספר לאחר אישור התוצאות.",

  performance_title: "ביצועי שחקן",
  p_total: "סה״כ תיקים",
  p_active: "תיקים פעילים",
  p_avg: "תשואה ממוצעת",
  p_month: "תשואה חודשית ממוצעת",
  p_top_name: "תיק מצטיין",
  p_top_return: "תשואת תיק מצטיין",
  tp_total: "כל התיקים שנפתחו, כולל תיקים שנסגרו.",
  tp_active: "תיקים פעילים כרגע.",
  tp_month: "ממוצע התשואה של התיקים הפעילים מתחילת החודש, לפי שעון ישראל.",
  tp_top: "התיק הפעיל עם התשואה המצטברת הגבוהה ביותר, כשהיא מעל 20%.",

  progress_title: "התקדמות במשחק",
  next_goal: "היעד הבא",
  next_title: "התואר הבא",
  t_progress: "הדרגה עולה עם XP שנצבר מביצועים, פעילות, מדליות והישגים.",
};

export const MESSAGES: Record<Lang, Messages> = { en, he };

// Locale tags for number and date formatting.
export const LOCALES: Record<Lang, string> = { en: "en-US", he: "he-IL" };
