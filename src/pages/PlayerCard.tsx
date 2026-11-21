import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Award, fetchPlayerCard, fetchPublicPlayerCard, PlayerCardResult, ProfileUpdate, saveProfile, VisitorView } from "../api/playerCard";
import { FollowButton } from "../components/social/FollowButton";
import { PROGRESSION_CHANGED, requestProgressionCheck, TitleCollection } from "../api/progression";
import { ArtDefs, CornerChart, TitleOrnament } from "../components/playerCard/art";
import { AwardDialog, AwardKind, AwardsPanel } from "../components/playerCard/AwardsPanel";
import { PlayerHeader } from "../components/playerCard/PlayerHeader";
import { StatsRow } from "../components/playerCard/StatsRow";
import { CompetitionsPanel, PerformancePanel, ProgressionPanel } from "../components/playerCard/TablePanels";
import { TitleCollectionDialog } from "../components/progression/TitleCollectionDialog";
import { FollowListsDialog } from "../components/social/FollowListsDialog";
import { DailyRewardsPanel } from "../components/dailyRewards/DailyRewardsPanel";
import { fetchTesterState } from "../api/testTools";
import { useLanguage } from "../i18n/LanguageContext";
import "../components/playerCard/playerCard.css";
import "../components/progression/progression.css";

/* ===========================================================================
   Player Card (docs/PRODUCT-SPEC-AND-GAP.md in the backend, Parts 3-4).
   ---------------------------------------------------------------------------
   Layout follows the reference image row by row: title, profile card, six
   stats, then competitions / achievements / medals, then progress /
   performance. The page sets its own `dir`, so in Hebrew it reads right to
   left exactly as the image does and in English it is the mirror image;
   the rest of the app is not yet right-to-left ready (see LanguageProvider).

   It is the signed-in player's own card, from GET /players/me/card. Adding
   ?demo=1 or ?demo=new shows demo data instead (see demoData.ts). Other
   players' cards come with the subscription rules.

   The player can edit their first name and bio, saved with PATCH
   /players/me. On demo data the edit is applied locally and lasts until
   reload.

   The active title sits under the level; "My Title Collection" opens the
   collection, and a choice there updates the card from the server's answer.
   When an unlock notice arrives (ProgressionWatcher), the card reloads so
   its XP, level and achievements stay current.
   =========================================================================== */

const PlayerCard = () => {
  const { t, dir, lang } = useLanguage();
  const [params] = useSearchParams();
  // /players/:id is another player's card, read-only (GET /players/:id/card).
  const { id: playerParam } = useParams();
  const otherId = playerParam ? Number(playerParam) : null;
  const demoParam = otherId ? null : params.get("demo");
  const scenario = demoParam === null ? undefined : demoParam === "new" ? "newcomer" : "established";

  const [visitor, setVisitor] = useState<VisitorView | null>(null);
  const [result, setResult] = useState<PlayerCardResult | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<{ award: Award; kind: AwardKind } | null>(null);
  const [titlesOpen, setTitlesOpen] = useState(false);
  const [followsOpen, setFollowsOpen] = useState(false);
  // The test panel's entry point, shown only to the test account.
  const [isTester, setIsTester] = useState(false);
  useEffect(() => {
    fetchTesterState()
      .then((s) => setIsTester(s !== null))
      .catch(() => setIsTester(false));
  }, []);

  useEffect(() => {
    let live = true;
    setResult(null);
    setVisitor(null);
    setFailed(false);
    if (otherId) {
      fetchPublicPlayerCard(otherId)
        .then((r) => {
          if (!live) return;
          setResult(r);
          setVisitor(r.visitor);
        })
        .catch(() => live && setFailed(true));
      return () => {
        live = false;
      };
    }
    fetchPlayerCard(scenario)
      .then((r) => live && setResult(r))
      .catch(() => live && setFailed(true));
    // Something unlocked: reload quietly, keeping the card on screen.
    const refresh = () => {
      if (!scenario) fetchPlayerCard().then((r) => live && setResult(r)).catch(() => undefined);
    };
    window.addEventListener(PROGRESSION_CHANGED, refresh);
    return () => {
      live = false;
      window.removeEventListener(PROGRESSION_CHANGED, refresh);
    };
  }, [scenario, otherId]);

  // Another player's card: read-only, with the way on to their portfolios.
  const readOnly = !!visitor && !visitor.isSelf;

  // Saves, then shows the identity the server answers with, so the card
  // reflects what was stored (trimmed, cleared) rather than what was typed.
  const saveEdit = async (update: ProfileUpdate) => {
    if (!result) return;
    const player = await saveProfile(update, result.data.player, result.demo);
    setResult((r) => (r ? { ...r, data: { ...r.data, player } } : r));
    if (!result.demo) requestProgressionCheck(); // a completed profile earns The Introduction
  };

  // A title was chosen in the collection: show it at once, then let the
  // watcher fetch anything it earned (a first choice is an achievement).
  const titleChanged = (collection: TitleCollection) => {
    const active = collection.titles.find((x) => x.id === collection.active_title_id) ?? null;
    setResult((r) =>
      r && r.data.progression.state === "available"
        ? {
            ...r,
            data: {
              ...r.data,
              progression: { state: "available", value: { ...r.data.progression.value, active_title: active } },
            },
          }
        : r
    );
    if (!scenario) requestProgressionCheck();
  };

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
            <PlayerHeader
              player={result.data.player}
              progression={result.data.progression}
              canEdit={!readOnly}
              canCheckNickname={!result.demo && !readOnly}
              onSave={saveEdit}
              onOpenTitles={readOnly ? undefined : () => setTitlesOpen(true)}
            />
            {readOnly && visitor && (
              // A visitor's way on: this player's portfolios, and following them (free).
              <section className="pc-card pc-panel pc-visit" aria-label={t("pc_their_portfolios")}>
                <div className="pc-visit-list">
                  {visitor.portfolios.map((p) => (
                    <Link key={p.id} className="pc-visit-pf" to={`/investor/${p.id}`}>
                      <bdi dir="auto">{p.name}</bdi>
                      <bdi dir="ltr" className={p.return_pct >= 0 ? "pc-pos" : "pc-neg"}>
                        {p.return_pct > 0 ? "+" : p.return_pct < 0 ? "−" : ""}
                        {Math.abs(p.return_pct).toFixed(1)}%
                      </bdi>
                    </Link>
                  ))}
                </div>
                <FollowButton playerId={visitor.playerId} />
              </section>
            )}
            {/* Who follows you is yours alone, and demo data has no real lists. */}
            <StatsRow data={result.data} onOpenFollows={result.demo || readOnly ? undefined : () => setFollowsOpen(true)} />
            {/* Reading order of the approved design: medals, achievements,
                competitions; then performance beside progress. */}
            <div className="pc-row3">
              <AwardsPanel
                kind="medal"
                awards={result.data.medals.top}
                total={result.data.medals.total}
                readOnly={readOnly}
                onOpen={(award) => setOpen({ award, kind: "medal" })}
              />
              <AwardsPanel
                kind="achievement"
                awards={result.data.achievements.top}
                total={result.data.achievements.total}
                demo={demoParam}
                readOnly={readOnly}
                onOpen={(award) => setOpen({ award, kind: "achievement" })}
              />
              <CompetitionsPanel competitions={result.data.competitions} />
            </div>
            <div className="pc-row2">
              <PerformancePanel stats={result.data.stats} />
              <ProgressionPanel progression={result.data.progression} />
            </div>
            {/* Daily rewards are the signed-in player's own; demo data has none. */}
            {!result.demo && !visitor && <DailyRewardsPanel compact />}
            {isTester && !result.demo && !visitor && (
              <Link className="pc-btn pc-test-link" to="/test-tools">
                {t("tt_open")}
              </Link>
            )}
          </>
        )}
      </div>
      <AwardDialog award={open?.award ?? null} kind={open?.kind ?? "medal"} onClose={() => setOpen(null)} />
      <FollowListsDialog
        open={followsOpen}
        onClose={() => setFollowsOpen(false)}
        onChanged={() => fetchPlayerCard().then(setResult).catch(() => undefined)}
      />
      <TitleCollectionDialog
        open={titlesOpen}
        scenario={scenario}
        onClose={() => setTitlesOpen(false)}
        onChanged={titleChanged}
      />
    </div>
  );
};

export default PlayerCard;
