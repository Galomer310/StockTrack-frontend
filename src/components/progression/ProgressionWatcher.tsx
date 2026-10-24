import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  acknowledgeNotifications,
  announceProgressionChanged,
  Ceremony,
  fetchNotifications,
  PROGRESSION_CHECK,
  setActiveTitle,
  Title,
  UnlockNotice,
} from "../../api/progression";
import { fill } from "../../i18n/fill";
import { useLanguage } from "../../i18n/LanguageContext";
import { Emblem } from "./emblems";
import { TitleCeremony } from "./TitleCeremony";
import "./progression.css";

/* ===========================================================================
   Unlock notices and the title ceremony, for the signed-in player.
   ---------------------------------------------------------------------------
   Mounted once, beside the routes. It asks the server what is new when the
   app opens, on every page change, and whenever something that can earn XP
   calls requestProgressionCheck() (a new portfolio, a profile edit, a title
   choice). Each notice is acknowledged as soon as it arrives, so a refresh
   never shows it twice.

   Notices appear one at a time, unobtrusively, in the corner; more than
   three at once are grouped into a single notice. Basic and advanced
   achievements get the compact notice, rare and above the framed one. The
   ceremony is a modal, and opens only when a new title tier is reached.
   =========================================================================== */

type NoticeGroup = { key: string; items: UnlockNotice[] };

const GROUP_ABOVE = 3;
const PRESTIGE = new Set(["rare", "epic", "exceptional"]);
const SHOW_MS = 5200;
const SHOW_PRESTIGE_MS = 7000;

export const ProgressionWatcher = () => {
  const { dir, lang } = useLanguage();
  const location = useLocation();
  const [queue, setQueue] = useState<NoticeGroup[]>([]);
  const [ceremony, setCeremony] = useState<Ceremony | null>(null);
  const [hasActiveTitle, setHasActiveTitle] = useState(false);
  const inFlight = useRef(false);
  const again = useRef(false);
  const seen = useRef(new Set<string>());

  const check = useCallback(async () => {
    // One request at a time; a check asked for meanwhile runs right after.
    if (inFlight.current) {
      again.current = true;
      return;
    }
    inFlight.current = true;
    try {
      const n = await fetchNotifications();
      const fresh = n.achievements.filter((a) => !seen.current.has(a.id));
      if (fresh.length) {
        fresh.forEach((a) => seen.current.add(a.id));
        const groups =
          fresh.length > GROUP_ABOVE
            ? [{ key: fresh.map((a) => a.id).join(), items: fresh }]
            : fresh.map((a) => ({ key: a.id, items: [a] }));
        setQueue((q) => [...q, ...groups]);
        acknowledgeNotifications({ achievement_ids: fresh.map((a) => a.id) }).catch(() => undefined);
        announceProgressionChanged();
      }
      setHasActiveTitle(!!n.active_title_id);
      setCeremony((open) => open ?? n.ceremony);
    } catch {
      // Progression is never worth an error on someone else's page; the next check retries.
    } finally {
      inFlight.current = false;
      if (again.current) {
        again.current = false;
        check();
      }
    }
  }, []);

  useEffect(() => {
    check();
  }, [location.pathname, check]);

  useEffect(() => {
    window.addEventListener(PROGRESSION_CHECK, check);
    return () => window.removeEventListener(PROGRESSION_CHECK, check);
  }, [check]);

  // The notice on show leaves by itself after a while.
  const current = queue[0];
  useEffect(() => {
    if (!current) return;
    const prestige = current.items.length > 1 || PRESTIGE.has(current.items[0].rarity);
    const timer = window.setTimeout(() => setQueue((q) => q.slice(1)), prestige ? SHOW_PRESTIGE_MS : SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [current]);

  const choose = async (title: Title) => {
    if (!ceremony) return;
    await setActiveTitle(title.id);
    await acknowledgeNotifications({ ceremony_tier: ceremony.tier }).catch(() => undefined);
    setCeremony(null);
    setHasActiveTitle(true);
    announceProgressionChanged();
    check(); // a first choice earns A Title to Remember
  };

  const keep = () => {
    if (!ceremony) return;
    acknowledgeNotifications({ ceremony_tier: ceremony.tier }).catch(() => undefined);
    setCeremony(null);
  };

  return (
    <>
      <div className="prg prg-notices" dir={dir} lang={lang} aria-live="polite">
        {current && <Notice key={current.key} group={current} onDismiss={() => setQueue((q) => q.slice(1))} />}
      </div>
      <TitleCeremony ceremony={ceremony} hasActiveTitle={hasActiveTitle} onChoose={choose} onKeep={keep} />
    </>
  );
};

// One notice, or one grouped notice for several achievements at once.
const Notice = ({ group, onDismiss }: { group: NoticeGroup; onDismiss: () => void }) => {
  const { t, lang, locale } = useLanguage();
  const n = (v: number) => new Intl.NumberFormat(locale).format(v);
  const one = group.items.length === 1 ? group.items[0] : null;
  const xp = group.items.reduce((sum, a) => sum + a.xp_awarded, 0);
  const prestige = !one || PRESTIGE.has(one.rarity);
  return (
    <div
      className={`prg-notice${prestige ? " is-prestige" : ""}`}
      role="status"
      style={{ "--accent": one ? one.accent_color : "#D9BE89" } as CSSProperties}
    >
      <span className="prg-notice-icon" aria-hidden="true">
        <Emblem name={one ? one.icon : "crown"} />
      </span>
      <span className="prg-notice-text">
        <span className="prg-eyebrow">
          {one ? t("prg_ach_unlocked") : fill(t("prg_ach_many"), { n: n(group.items.length) })}
        </span>
        <span className="prg-notice-name prg-serif">
          {one ? one.name[lang] : group.items.map((a) => a.name[lang]).join(" · ")}
        </span>
        <bdi className="prg-notice-xp" dir="ltr">+{n(xp)} XP</bdi>
      </span>
      <button type="button" className="prg-notice-close" onClick={onDismiss} aria-label={t("close")}>
        ×
      </button>
    </div>
  );
};
