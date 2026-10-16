import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Award, fetchPlayerCard, PlayerCardResult } from "../api/playerCard";
import { ArtDefs, CornerChart, TitleOrnament } from "../components/playerCard/art";
import { AwardDialog, AwardKind, AwardsPanel } from "../components/playerCard/AwardsPanel";
import { PlayerHeader } from "../components/playerCard/PlayerHeader";
import { StatsRow } from "../components/playerCard/StatsRow";
import { CompetitionsPanel, PerformancePanel, ProgressionPanel } from "../components/playerCard/TablePanels";
import { useLanguage } from "../i18n/LanguageContext";
import "../components/playerCard/playerCard.css";

/* ===========================================================================
   Player Card (docs/PRODUCT-SPEC-AND-GAP.md in the backend, Parts 3-4).
   ---------------------------------------------------------------------------
   Layout follows the reference image row by row: title, profile card, six
   stats, then competitions / achievements / medals, then progress /
   performance. The page sets its own `dir`, so in Hebrew it reads right to
   left exactly as the image does and in English it is the mirror image;
   the rest of the app is not yet right-to-left ready (see LanguageProvider).

   It is the signed-in player's own card for now, so the bio is editable.
   Other players' cards come with the player endpoints.
   =========================================================================== */

const PlayerCard = () => {
  const { t, dir, lang } = useLanguage();
  const [params] = useSearchParams();
  const scenario = params.get("demo") === "new" ? "newcomer" : "established";

  const [result, setResult] = useState<PlayerCardResult | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<{ award: Award; kind: AwardKind } | null>(null);

  useEffect(() => {
    let live = true;
    setResult(null);
    setFailed(false);
    fetchPlayerCard(scenario)
      .then((r) => live && setResult(r))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [scenario]);

  const setBio = (bio: string) =>
    setResult((r) => (r ? { ...r, data: { ...r.data, player: { ...r.data.player, bio } } } : r));

  return (
    <div className="pc" dir={dir} lang={lang}>
      <ArtDefs />
      <div className="pc-wrap">
        <header className="pc-head">
          <CornerChart />
          <h1 className="pc-title">
            <TitleOrnament />
            <span className="pc-gold-text">{t("pc_title")}</span>
            <TitleOrnament />
          </h1>
        </header>

        {failed && <p className="pc-error" role="alert">{t("load_failed")}</p>}
        {!result && !failed && <p className="pc-status" role="status">{t("loading")}</p>}

        {result && (
          <>
            {result.demo && <p className="pc-demo-note">{t("demo_notice")}</p>}
            <PlayerHeader player={result.data.player} canEdit onBioSaved={setBio} />
            <StatsRow data={result.data} />
            <div className="pc-row3">
              <CompetitionsPanel competitions={result.data.competitions} />
              <AwardsPanel
                kind="achievement"
                awards={result.data.achievements.top}
                onOpen={(award) => setOpen({ award, kind: "achievement" })}
              />
              <AwardsPanel
                kind="medal"
                awards={result.data.medals.top}
                onOpen={(award) => setOpen({ award, kind: "medal" })}
              />
            </div>
            <div className="pc-row2">
              <ProgressionPanel player={result.data.player} />
              <PerformancePanel stats={result.data.stats} />
            </div>
          </>
        )}
      </div>
      <AwardDialog award={open?.award ?? null} kind={open?.kind ?? "medal"} onClose={() => setOpen(null)} />
    </div>
  );
};

export default PlayerCard;
