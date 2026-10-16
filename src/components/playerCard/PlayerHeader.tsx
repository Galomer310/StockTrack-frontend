import { useState } from "react";
import { BIO_MAX_LENGTH, bioLength, PlayerCardData, saveBio } from "../../api/playerCard";
import { useLanguage } from "../../i18n/LanguageContext";
import { formatNumber } from "./format";
import { Icon } from "./icons";
import { reasonKey } from "./reasons";

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
   in place of a number. The bio is the one thing here the owner can change.
   =========================================================================== */

type Player = PlayerCardData["player"];

export const PlayerHeader = ({
  player,
  progression,
  canEdit,
  onBioSaved,
}: {
  player: Player;
  progression: PlayerCardData["progression"];
  canEdit: boolean;
  onBioSaved: (bio: string) => void;
}) => {
  const { t, locale } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(player.bio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const startEditing = () => {
    setDraft(player.bio);
    setError(false);
    setEditing(true);
  };

  const submit = async () => {
    setSaving(true);
    setError(false);
    try {
      onBioSaved(await saveBio(draft));
      setEditing(false);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  const length = bioLength(draft);

  return (
    <section className="pc-card pc-profile" aria-label={t("pc_title")}>
      <div className="pc-bio">
        <h2>
          <Icon name="person" />
          {t("bio_title")}
        </h2>
        {editing ? (
          <>
            <textarea
              id="pc-bio-input"
              dir="auto"
              value={draft}
              maxLength={BIO_MAX_LENGTH}
              aria-label={t("bio_title")}
              aria-describedby="pc-bio-count"
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
            <div className="pc-bio-actions">
              <button type="button" className="pc-btn" onClick={submit} disabled={saving || length > BIO_MAX_LENGTH}>
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
            {error && <p className="pc-error">{t("bio_save_failed")}</p>}
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
