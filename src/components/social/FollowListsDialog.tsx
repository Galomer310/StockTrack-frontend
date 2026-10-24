import { useEffect, useRef, useState } from "react";
import {
  fetchMyFollowers,
  fetchMyFollowing,
  FollowListEntry,
  followPlayer,
  unfollowPlayer,
} from "../../api/follows";
import { requestProgressionCheck } from "../../api/progression";
import { fill } from "../../i18n/fill";
import { useLanguage } from "../../i18n/LanguageContext";
import "../progression/progression.css";

/* ===========================================================================
   Your followers and the players you follow (Player Card).
   ---------------------------------------------------------------------------
   Only ever your own lists: the server answers /players/me/... for the
   signed-in player and nobody else. Follow back and unfollow act at once
   and keep their row in place until the dialog is reopened, so a mistaken
   tap can be undone where it happened.
   =========================================================================== */

type Tab = "followers" | "following";

export const FollowListsDialog = ({
  open,
  onClose,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  /** After a follow or unfollow, so the card's counts can refresh. */
  onChanged: () => void;
}) => {
  const { t, dir, lang, locale } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<Tab>("followers");
  const [lists, setLists] = useState<Record<Tab, FollowListEntry[]> | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let live = true;
    setLists(null);
    setFailed(false);
    Promise.all([fetchMyFollowers(), fetchMyFollowing()])
      .then(([followers, following]) => live && setLists({ followers, following }))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [open]);

  const toggle = async (entry: FollowListEntry) => {
    setBusy(entry.id);
    try {
      const state = await (entry.you_follow ? unfollowPlayer(entry.id) : followPlayer(entry.id));
      setLists((l) =>
        l && {
          followers: l.followers.map((x) => (x.id === entry.id ? { ...x, you_follow: state.following } : x)),
          following: l.following.map((x) => (x.id === entry.id ? { ...x, you_follow: state.following } : x)),
        }
      );
      onChanged();
      requestProgressionCheck();
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  };

  const date = (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
  const n = (v: number) => new Intl.NumberFormat(locale).format(v);
  const rows = lists?.[tab] ?? [];

  return (
    <dialog
      ref={ref}
      className="prg prg-dialog prg-follows"
      dir={dir}
      lang={lang}
      aria-labelledby="prg-follows-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="prg-dialog-frame">
        <header className="prg-dialog-head">
          <h2 id="prg-follows-title" className="prg-serif">{t("follow_lists_title")}</h2>
          <p className="prg-muted">{t("follow_lists_private")}</p>
          <button type="button" className="prg-close" onClick={onClose} aria-label={t("close")}>
            ×
          </button>
        </header>

        <div className="prg-tabs prg-tabs--two" role="tablist" aria-label={t("follow_lists_title")}>
          {(["followers", "following"] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`prg-tab${tab === id ? " is-selected" : ""}`}
              onClick={() => setTab(id)}
            >
              <span className="prg-tab-text">
                <span className="prg-tab-name">{t(id === "followers" ? "follow_tab_followers" : "follow_tab_following")}</span>
                <span className="prg-tab-count">{lists ? n(lists[id].length) : " "}</span>
              </span>
            </button>
          ))}
        </div>

        {failed && <p className="prg-error" role="alert">{t("follow_failed")}</p>}
        {!lists && !failed && <p className="prg-muted prg-center" role="status">{t("loading")}</p>}
        {lists && rows.length === 0 && (
          <p className="prg-muted prg-center prg-follow-empty">
            {t(tab === "followers" ? "follow_empty_followers" : "follow_empty_following")}
          </p>
        )}
        {rows.length > 0 && (
          <ul className="prg-title-list prg-follow-list" role="tabpanel">
            {rows.map((p) => (
              <li key={p.id} className="prg-follow-row">
                <span className="prg-follow-avatar" aria-hidden="true">
                  {p.display_name.charAt(0).toUpperCase()}
                </span>
                <span className="prg-follow-main">
                  <bdi className="prg-follow-name">{p.display_name}</bdi>
                  <span className="prg-follow-since">{fill(t("follow_since"), { date: date(p.since) })}</span>
                </span>
                <button
                  type="button"
                  className={`prg-chip prg-follow-btn${p.you_follow ? "" : " is-cta"}`}
                  onClick={() => toggle(p)}
                  disabled={busy !== null}
                >
                  {p.you_follow ? t("follow_unfollow") : tab === "followers" ? t("follow_back") : t("follow_follow")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
};
