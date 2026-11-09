/* ===========================================================================
   A small performance line for a portfolio card (spec Part 1, carousel).
   The values are the portfolio's genuine performance index from the server,
   so a capital reward never shows as a jump. Green when the period ends at
   or above where it started, red otherwise; the dotted line is the start.
   Decorative: the return beside it carries the number.
   =========================================================================== */

export const Sparkline = ({ values, width = 120, height = 32 }: { values: number[]; width?: number; height?: number }) => {
  if (values.length < 2) return <span className="sparkline is-empty" style={{ width, height }} aria-hidden="true" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => (i / (values.length - 1)) * (width - 2) + 1;
  const y = (v: number) => height - 1 - ((v - min) / span) * (height - 2);
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const up = values[values.length - 1] >= values[0];
  return (
    <svg className={`sparkline ${up ? "is-up" : "is-down"}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <line x1="1" x2={width - 1} y1={y(values[0])} y2={y(values[0])} className="sparkline-base" />
      <polyline points={points} fill="none" />
    </svg>
  );
};
