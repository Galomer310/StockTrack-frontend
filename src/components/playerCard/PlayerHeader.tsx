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
import { AVATARS, findAvatar } from "../avatars/avatars";
import { PlayerStanding } from "../progression/PlayerStanding";
import { Icon } from "./icons";

const ERROR_TEXT: Record<ProfileErrorCode, MessageKey> = {
  BIO_TOO_LONG: "err_bio_too_long",
  FIRST_NAME_TOO_LONG: "err_first_name_too_long",
  INVALID_CHARACTERS: "err_invalid_characters",
  NOT_EDITABLE: "err_not_editable",
  INVALID_AVATAR: "err_invalid_avatar",
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

   Under the name: the level, and the active title directly beneath it
   (PlayerStanding). The level is never edited - XP sets it - and the title
   is chosen from the player's collection. The owner can edit the first name,
   the bio and the picture (spec 11), the picture from the avatar gallery;
   the nickname and uploaded pictures follow once their rules and storage
   exist. While editing, the large picture previews the avatar being chosen.
   =========================================================================== */

type Player = PlayerCardData["player"];

export const PlayerHeader = ({
  player,
  progression,
  canEdit,
  onSave,
  onOpenTitles,
}: {
  player: Player;
  progression: PlayerCardData["progression"];
  canEdit: boolean;
  /** Saves the edit; rejects with ProfileSaveError when the server refuses it. */
  onSave: (update: ProfileUpdate) => Promise<void>;
  onOpenTitles: () => void;
}) => {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState(player.bio);
  const [nameDraft, setNameDraft] = useState(player.first_name ?? "");
  const [avatarDraft, setAvatarDraft] = useState<string | null>(player.avatar_id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<MessageKey | null>(null);

  const startEditing = () => {
    setBioDraft(player.bio);
    setNameDraft(player.first_name ?? "");
    setAvatarDraft(findAvatar(player.avatar_id) ? player.avatar_id : null);
    setError(null);
    setEditing(true);
  };

  // Sends only what changed, so an untouched field is never rewritten.
  const submit = async () => {
    const update: ProfileUpdate = {};
    if (bioDraft.trim() !== player.bio) update.bio = bioDraft;
    if ((nameDraft.trim() || null) !== player.first_name) update.first_name = nameDraft.trim() || null;
    if (avatarDraft !== player.avatar_id) update.avatar_id = avatarDraft;
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
  const shownAvatar = findAvatar(editing ? avatarDraft : player.avatar_id);
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
            <fieldset className="pc-avatar-picker">
              <legend>{t("avatar_choose")}</legend>
              <div className="pc-avatar-options">
                <label className="pc-avatar-option" title={t("avatar_default")}>
                  <input
                    type="radio"
                    name="pc-avatar"
                    id="pc-avatar-default"
                    checked={avatarDraft === null}
                    onChange={() => setAvatarDraft(null)}
                  />
                  <span className="pc-avatar-option-art pc-avatar-option-initial" aria-hidden="true">
                    {player.nickname ? player.nickname.charAt(0).toUpperCase() : <Icon name="person" />}
                  </span>
                  <span className="pc-visually-hidden">{t("avatar_default")}</span>
                </label>
                {AVATARS.map((a) => (
                  <label key={a.id} className="pc-avatar-option" title={t(a.label)}>
                    <input
                      type="radio"
                      name="pc-avatar"
                      id={`pc-avatar-${a.id}`}
                      checked={avatarDraft === a.id}
                      onChange={() => setAvatarDraft(a.id)}
                    />
                    <img className="pc-avatar-option-art" src={a.src} alt="" />
                    <span className="pc-visually-hidden">{t(a.label)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
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
        <PlayerStanding progression={progression} onOpenCollection={onOpenTitles} />
      </div>

      <div
        className="pc-avatar"
        role="img"
        aria-label={player.nickname ? `${t("avatar_label")}: @${player.nickname}` : t("avatar_label")}
      >
        {shownAvatar ? (
          <img src={shownAvatar.src} alt="" />
        ) : player.avatar_url && !editing ? (
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
