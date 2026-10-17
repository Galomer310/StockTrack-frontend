// Number and date formatting for the Player Card, in the reader's language.

export const formatNumber = (n: number, locale: string | undefined): string => new Intl.NumberFormat(locale).format(n);

export const formatDate = (iso: string, locale: string | undefined): string =>
  new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(
    // Noon, so the calendar date holds in every time zone.
    new Date(`${iso}T12:00:00`)
  );

// "+24.8%", "−3.2%", "0.0%". A true minus sign, not a hyphen.
export const formatPercent = (fraction: number): string => {
  const sign = fraction > 0 ? "+" : fraction < 0 ? "−" : "";
  return `${sign}${Math.abs(fraction * 100).toFixed(1)}%`;
};

export const toneOf = (fraction: number): "pos" | "neg" | "flat" =>
  fraction > 0 ? "pos" : fraction < 0 ? "neg" : "flat";
