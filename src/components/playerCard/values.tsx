import { ReactNode } from "react";
import type { CardValue } from "../../api/playerCard";
import { useLanguage } from "../../i18n/LanguageContext";
import { formatPercent, toneOf } from "./format";
import { Icon } from "./icons";
import { reasonKey } from "./reasons";

// A return as a percentage, green or red by sign. Isolated left-to-right so
// "+24.8%" keeps its sign in front inside Hebrew text.
export const Percent = ({ value }: { value: number }) => (
  <bdi dir="ltr" className={`pc-${toneOf(value)}`}>
    {formatPercent(value)}
  </bdi>
);

// What a locked or unavailable figure shows in its place. It stays where the
// value would be, so locking never moves or resizes anything (spec 4, 9).
export const NotShown = ({ value, compact = false }: { value: CardValue<unknown>; compact?: boolean }) => {
  const { t } = useLanguage();
  const key = reasonKey(value);
  if (!key) return null;
  return (
    <span className={`pc-locked${compact ? " pc-locked--row" : ""}`}>
      {value.state === "locked" && <Icon name="lock" />}
      <span>{t(key)}</span>
    </span>
  );
};

// Renders an available value through `render`, or the locked/unavailable
// state in its place.
export function Gated<T>({
  value,
  render,
  compact = false,
}: {
  value: CardValue<T>;
  render: (v: T) => ReactNode;
  compact?: boolean;
}) {
  return value.state === "available" ? <>{render(value.value)}</> : <NotShown value={value} compact={compact} />;
}
