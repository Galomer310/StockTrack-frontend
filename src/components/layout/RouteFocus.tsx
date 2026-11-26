import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MAIN_ID } from "./SkipLink";

/* ===========================================================================
   What a page change sounds like (WCAG 2.4.2 page titled, 2.4.3 focus order).
   ---------------------------------------------------------------------------
   In a single-page app a click on a tab swaps the content without a page
   load, so a screen reader announces nothing and keyboard focus stays on
   the link that was pressed, back in the header. After each navigation
   this:
     - names the browser tab after the new page's main heading, so every
       screen has its own title instead of "Investments" everywhere;
     - moves focus to that heading (or to <main> if the page has none),
       which makes the screen reader read where the user has landed.

   Pages are lazy chunks and some headings appear only after data arrives,
   so the heading is looked for for up to six seconds. The first load is
   left alone (the browser already starts at the top), and so is a change
   while a dialog is open, which owns focus until it closes.
   =========================================================================== */

const APP_NAME = "Investments";
// Data-heavy pages (the Player Card, the Arena) render their heading only
// once their first request returns.
const WAIT_MS = 6000;
const STEP_MS = 100;

export const RouteFocus = () => {
  const { pathname } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    const isFirst = first.current;
    first.current = false;
    // Whatever had focus when the route changed (usually the link pressed).
    // If focus has moved on by the time the heading appears, the user is
    // already working on the page and it is not taken away from them.
    const startFocus = document.activeElement;
    let waited = 0;
    let timer = 0;

    const settle = () => {
      const main = document.getElementById(MAIN_ID);
      const heading = main?.querySelector<HTMLElement>("h1");
      if (!heading && waited < WAIT_MS) {
        waited += STEP_MS;
        timer = window.setTimeout(settle, STEP_MS);
        return;
      }
      const name = heading?.textContent?.replace(/\s+/g, " ").trim();
      document.title = name && name !== APP_NAME ? `${name} · ${APP_NAME}` : APP_NAME;

      if (isFirst || !main) return;
      if (document.querySelector("dialog[open], [aria-modal='true']")) return;
      const now = document.activeElement;
      if (now && now !== startFocus && now !== document.body) return;
      const target = heading ?? main;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    };

    settle();
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
};
