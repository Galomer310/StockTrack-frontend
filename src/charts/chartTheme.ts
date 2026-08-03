import { Chart as ChartJS } from "chart.js";

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
