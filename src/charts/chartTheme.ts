import { Chart as ChartJS, Tooltip, Legend } from "chart.js";

// Register the two plugins this file configures, before configuring them.
//
// Chart.js only creates `defaults.plugins.tooltip` when the Tooltip plugin is
// registered, so writing to it beforehand throws "Cannot set properties of
// undefined" - which happens during module evaluation and therefore takes the
// whole app down with a blank page, not just the charts.
//
// This used to work by luck: chartTheme was imported only by main.tsx, after
// App had pulled in a chart component that happened to register Tooltip first.
// The moment anything imported a colour from here, that order flipped.
// Registering is idempotent, so doing it here costs nothing and makes this
// module independent of who imports it first.
ChartJS.register(Tooltip, Legend);

// Chart.js defaults to near-black text and light grid lines, which vanish on
// the dark ground. These values are deliberately mid-tone so they stay legible
// in both the dark and light variants without needing to re-render on toggle.
ChartJS.defaults.color = "#8D97AC";
ChartJS.defaults.borderColor = "rgba(140, 150, 170, 0.16)";
ChartJS.defaults.font.family =
  "'Inter', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
ChartJS.defaults.font.size = 12;

// Tooltips styled to match the surface tokens.
ChartJS.defaults.plugins.tooltip.backgroundColor = "rgba(16, 21, 31, 0.96)";
ChartJS.defaults.plugins.tooltip.titleColor = "#E9ECF3";
ChartJS.defaults.plugins.tooltip.bodyColor = "#8D97AC";
ChartJS.defaults.plugins.tooltip.borderColor = "rgba(214, 163, 68, 0.32)";
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.displayColors = false;

ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
ChartJS.defaults.plugins.legend.labels.boxWidth = 8;

// Shared series colours, matching the gold/steel accents in style.css.
export const SERIES = {
  gold: "#D6A344",
  goldFill: "rgba(214, 163, 68, 0.14)",
  steel: "#5B8CB8",
  steelFill: "rgba(91, 140, 184, 0.12)",
};

/* ---------------------------------------------------------------------------
   Categorical palette, for charts where colour carries IDENTITY (which ticker)
   rather than magnitude.
   ---------------------------------------------------------------------------
   Six fixed slots, assigned in order and never cycled or generated. Both
   columns are the same six hues stepped for their own surface - the dark set is
   not an automatic flip of the light one.

   Validated against this app's own chart surfaces (dark #10151F, light
   #FFFFFF): every slot sits inside the lightness band and above the chroma
   floor, worst adjacent colour-blind separation is ΔE 8.4 dark / 9.1 light
   (target ≥ 8) and worst normal-vision separation 19.3 / 19.6 (floor 15).

   On the LIGHT surface three of the six fall below 3:1 contrast, which carries
   an obligation rather than a choice: any chart using this palette in light
   mode must also print its values as text (a legend with percentages, or the
   table beneath the chart). Colour alone is not allowed to carry the reading.

   Six is the ceiling. A seventh category folds into "Other" - a generated or
   recycled hue would be indistinguishable from an existing slot under CVD.
   --------------------------------------------------------------------------- */
export const CATEGORICAL = {
  dark: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300"],
  light: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"],
};

// Cash is deliberately NOT one of the categorical hues. It is not a position
// and not a bet, so it reads as a neutral remainder rather than as another
// holding. Grey fails the chroma floor by design - that is what marks it out as
// "not a series" - and both steps clear 3:1 against their own surface.
export const NEUTRAL = {
  dark: "#8D97AC",
  light: "#5C6679",
};

// The surface each chart sits on. Slices are separated by a 2px ring in this
// colour, which reads as a gap rather than as a drawn border.
export const CHART_SURFACE = {
  dark: "#10151F",
  light: "#FFFFFF",
};
