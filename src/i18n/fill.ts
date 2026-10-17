// Fills {placeholders} in a translated message: fill("Sold {qty} {symbol}",
// { qty: 3, symbol: "AAPL" }). Word order differs between Hebrew and
// English, so values are named rather than appended - each language places
// them where its grammar needs them.
export const fill = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));

// Wraps a value that must read left to right - a signed percentage, a price -
// in Unicode isolate marks, for use inside fill(). Inside Hebrew text "+2.93%"
// would otherwise show as "2.93%+". The plain-text form of <bdi dir="ltr">.
export const ltr = (value: string): string => `\u2066${value}\u2069`;

// A server error worth showing to the reader. In English the server's own
// message is the most specific one there is. In Hebrew it would be English
// text in a Hebrew screen, so a translated message is chosen by the error's
// code, or a general one when the code is not known.
export const serverMessage = (
  err: unknown,
  lang: "he" | "en",
  byCode: Record<string, string>,
  fallback: string
): string =>
  errorBodyMessage(
    (err as { response?: { data?: ErrorBody } })?.response?.data,
    lang,
    byCode,
    fallback
  );

export interface ErrorBody {
  error?: string;
  code?: string;
}

// The same choice made from an error body already in hand, for the screens
// that call the server with fetch rather than axios (sign-in and sign-up).
export const errorBodyMessage = (
  data: ErrorBody | undefined,
  lang: "he" | "en",
  byCode: Record<string, string>,
  fallback: string
): string => {
  if (lang === "en") return data?.error || fallback;
  return (data?.code && byCode[data.code]) || fallback;
};
