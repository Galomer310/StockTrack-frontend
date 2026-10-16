import { useState } from "react";
import { BIO_MAX_LENGTH, bioLength, PlayerCardData, saveBio } from "../../api/playerCard";
import { useLanguage } from "../../i18n/LanguageContext";
import { formatNumber } from "./format";
import { Icon } from "./icons";

/* ===========================================================================
   Area 1 - the player header (spec 3).
   ---------------------------------------------------------------------------
   Bio, divider, identity, picture, in that order. In Hebrew that puts the
   bio on the right and the picture on the left, as in the reference image.

   The nickname is the largest text and the first name, if any, sits under
   it. The image shows a full name above the nickname instead; the spec's
   text decides, and it makes the nickname the player's primary identity.

   Level and title are shown, never edited: the system sets them. The bio is
   the one thing here the owner can change.
   =========================================================================== */

type Player = PlayerCardData["player"];

export const PlayerHeader = ({
  player,
  canEdit,
  onBioSaved,
}: {
  player: Player;
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
        <p className="pc-nickname">
          <bdi dir="ltr">@{player.nickname}</bdi>
        </p>
        {player.first_name && <span className="pc-first-name">{player.first_name}</span>}
        <div className="pc-badges">
          <span className="pc-badge">
            <Icon name="star" />
            <bdi dir="ltr">
              {t("level")} {formatNumber(player.level, locale)}
            </bdi>
          </span>
          <span className="pc-badge">
            <Icon name="crown" />
            <bdi dir="ltr">{player.title}</bdi>
          </span>
        </div>
      </div>

      <div className="pc-avatar" role="img" aria-label={`${t("avatar_label")}: @${player.nickname}`}>
        {player.avatar_url ? (
          <img src={player.avatar_url} alt="" />
        ) : (
          // The default picture for a player who has not chosen one (spec 3.1).
          <span className="pc-avatar-default">
            <span className="pc-gold-text">{player.nickname.charAt(0).toUpperCase()}</span>
          </span>
        )}
      </div>
    </section>
  );
};
