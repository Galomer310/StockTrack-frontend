import { useState } from "react";
import {
  BIO_MAX_LENGTH,
  bioLength,
  FIRST_NAME_MAX_LENGTH,
  PlayerCardData,
  ProfileErrorCode,
  ProfileSaveError,
  ProfileUpdate,
} from "../../api/playerCard";
import { useLanguage } from "../../i18n/LanguageContext";
import { MessageKey } from "../../i18n/messages";
import { formatNumber } from "./format";
import { Icon } from "./icons";
import { reasonKey } from "./reasons";

const ERROR_TEXT: Record<ProfileErrorCode, MessageKey> = {
  BIO_TOO_LONG: "err_bio_too_long",
  FIRST_NAME_TOO_LONG: "err_first_name_too_long",
  INVALID_CHARACTERS: "err_invalid_characters",
  NOT_EDITABLE: "err_not_editable",
  UNKNOWN: "bio_save_failed",
};

// Both fields are single-line on the card, and the server refuses line
// breaks, so a pasted one becomes a space as it is typed.
const oneLine = (text: string): string => text.replace(/[\r\n]+/g, " ");

/* ===========================================================================
   Area 1 - the player header (spec 3).
   ---------------------------------------------------------------------------
   Bio, divider, identity, picture, in that order. In Hebrew that puts the
   bio on the right and the picture on the left, as in the reference image.

   The nickname is the largest text and the first name, if any, sits under
   it. The image shows a full name above the nickname instead; the spec's
   text decides, and it makes the nickname the player's primary identity.

   Level and title are shown, never edited: the system sets them. While the
   XP rules are undefined the server withholds them, and the badge says so
   in place of a number. The owner can edit the first name and the bio (spec
   11); the nickname and picture follow once their rules and storage exist.
   =========================================================================== */

type Player = PlayerCardData["player"];

export const PlayerHeader = ({
  player,
  progression,
  canEdit,
  onSave,
}: {
  player: Player;
  progression: PlayerCardData["progression"];
  canEdit: boolean;
  /** Saves the edit; rejects with ProfileSaveError when the server refuses it. */
  onSave: (update: ProfileUpdate) => Promise<void>;
}) => {
  const { t, locale } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState(player.bio);
  const [nameDraft, setNameDraft] = useState(player.first_name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<MessageKey | null>(null);

  const startEditing = () => {
    setBioDraft(player.bio);
    setNameDraft(player.first_name ?? "");
    setError(null);
    setEditing(true);
  };

  // Sends only what changed, so an untouched field is never rewritten.
  const submit = async () => {
    const update: ProfileUpdate = {};
    if (bioDraft.trim() !== player.bio) update.bio = bioDraft;
    if ((nameDraft.trim() || null) !== player.first_name) update.first_name = nameDraft.trim() || null;
    if (Object.keys(update).length === 0) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(update);
      setEditing(false);
    } catch (err) {
      setError(ERROR_TEXT[err instanceof ProfileSaveError ? err.code : "UNKNOWN"]);
    } finally {
      setSaving(false);
    }
  };

  const length = bioLength(bioDraft);
  const tooLong = length > BIO_MAX_LENGTH || bioLength(nameDraft) > FIRST_NAME_MAX_LENGTH;

  return (
    <section className="pc-card pc-profile" aria-label={t("pc_title")}>
      <div className="pc-bio">
        <h2>
          <Icon name="person" />
          {t("bio_title")}
        </h2>
        {editing ? (
          <>
            <label className="pc-field" htmlFor="pc-first-name-input">
              <span>{t("first_name_label")}</span>
              <input
                id="pc-first-name-input"
                type="text"
                dir="auto"
                value={nameDraft}
                maxLength={FIRST_NAME_MAX_LENGTH}
                autoComplete="given-name"
                onChange={(e) => setNameDraft(oneLine(e.target.value))}
                autoFocus
              />
            </label>
            <textarea
              id="pc-bio-input"
              dir="auto"
              value={bioDraft}
              maxLength={BIO_MAX_LENGTH}
              aria-label={t("bio_title")}
              aria-describedby="pc-bio-count"
              onChange={(e) => setBioDraft(oneLine(e.target.value))}
            />
            <div className="pc-bio-actions">
              <button type="button" className="pc-btn" onClick={submit} disabled={saving || tooLong}>
                {t("save")}
              </button>
              <button type="button" className="pc-btn" onClick={() => setEditing(false)} disabled={saving}>
                {t("cancel")}
              </button>
              <span id="pc-bio-count" className={`pc-counter${length >= BIO_MAX_LENGTH ? " is-full" : ""}`} aria-live="polite">
                <bdi dir="ltr">
                  {length}/{BIO_MAX_LENGTH}
                </bdi>
              </span>
            </div>
            {error && <p className="pc-error" role="alert">{t(error)}</p>}
          </>
        ) : (
          <>
            <p dir="auto">{player.bio}</p>
            {canEdit && (
              <div className="pc-bio-actions">
                <button type="button" className="pc-btn" onClick={startEditing}>
                  <Icon name="pencil" />
                  {t("bio_edit")}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="pc-divider" aria-hidden="true" />

      <div className="pc-identity">
        {player.nickname ? (
          <p className="pc-nickname">
            <bdi dir="ltr">@{player.nickname}</bdi>
          </p>
        ) : (
          <p className="pc-nickname is-missing">{t("nickname_missing")}</p>
        )}
        {player.first_name && <span className="pc-first-name">{player.first_name}</span>}
        <div className="pc-badges">
          {progression.state === "available" ? (
            <>
              <span className="pc-badge">
                <Icon name="star" />
                <bdi dir="ltr">
                  {t("level")} {formatNumber(progression.value.level, locale)}
                </bdi>
              </span>
              <span className="pc-badge">
                <Icon name="crown" />
                <bdi dir="ltr">{progression.value.title}</bdi>
              </span>
            </>
          ) : (
            <span className="pc-badge is-muted">
              <Icon name="star" />
              <span>
                <bdi dir="ltr">{t("level")}</bdi>: {t(reasonKey(progression) ?? "unavailable_missing")}
              </span>
            </span>
          )}
        </div>
      </div>

      <div
        className="pc-avatar"
        role="img"
        aria-label={player.nickname ? `${t("avatar_label")}: @${player.nickname}` : t("avatar_label")}
      >
        {player.avatar_url ? (
          <img src={player.avatar_url} alt="" />
        ) : (
          // The default picture for a player who has not chosen one (spec 3.1):
          // the nickname's initial, or a silhouette before there is a nickname.
          <span className="pc-avatar-default">
            {player.nickname ? (
              <span className="pc-gold-text">{player.nickname.charAt(0).toUpperCase()}</span>
            ) : (
              <Icon name="person" className="pc-avatar-silhouette" />
            )}
          </span>
        )}
      </div>
    </section>
  );
};
