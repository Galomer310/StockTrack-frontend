import axiosInstance from "./axiosInstance";

/* ===========================================================================
   Usernames.
   ---------------------------------------------------------------------------
   The rules mirror the backend's src/services/nickname.ts, so a mistake is
   explained as it is typed without a request. The server stays the judge:
   it re-checks everything, and only it knows whether a name is taken.

   3-20 characters; Hebrew or English letters, digits, "_" and "."; at least
   one letter; no "." first, last or doubled; unique without regard to case;
   a few reserved names (checked by the server only). Changed at most once
   every 30 days.
   =========================================================================== */

export const NICKNAME_MIN_LENGTH = 3;
export const NICKNAME_MAX_LENGTH = 20;

export type NicknameErrorCode =
  | "NICKNAME_REQUIRED"
  | "NICKNAME_TOO_SHORT"
  | "NICKNAME_TOO_LONG"
  | "NICKNAME_INVALID_CHARACTERS"
  | "NICKNAME_INVALID_DOTS"
  | "NICKNAME_NEEDS_LETTER"
  | "NICKNAME_RESERVED"
  | "NICKNAME_TAKEN"
  | "NICKNAME_CHANGE_TOO_SOON";

export const NICKNAME_ERROR_CODES: NicknameErrorCode[] = [
  "NICKNAME_REQUIRED",
  "NICKNAME_TOO_SHORT",
  "NICKNAME_TOO_LONG",
  "NICKNAME_INVALID_CHARACTERS",
  "NICKNAME_INVALID_DOTS",
  "NICKNAME_NEEDS_LETTER",
  "NICKNAME_RESERVED",
  "NICKNAME_TAKEN",
  "NICKNAME_CHANGE_TOO_SOON",
];

const ALLOWED = /^[A-Za-z0-9_.א-ת]+$/;
const HAS_LETTER = /[A-Za-zא-ת]/;

/** The username as it would be saved: trimmed, without a leading "@". */
export const cleanNickname = (raw: string): string => raw.trim().normalize("NFC").replace(/^@/, "");

/** The first rule the username breaks, or null if it passes the rules the client knows. */
export const nicknameRuleError = (raw: string): NicknameErrorCode | null => {
  const nickname = cleanNickname(raw);
  if (nickname === "") return "NICKNAME_REQUIRED";
  if (!ALLOWED.test(nickname)) return "NICKNAME_INVALID_CHARACTERS";
  const length = [...nickname].length;
  if (length < NICKNAME_MIN_LENGTH) return "NICKNAME_TOO_SHORT";
  if (length > NICKNAME_MAX_LENGTH) return "NICKNAME_TOO_LONG";
  if (nickname.startsWith(".") || nickname.endsWith(".") || nickname.includes("..")) return "NICKNAME_INVALID_DOTS";
  if (!HAS_LETTER.test(nickname)) return "NICKNAME_NEEDS_LETTER";
  return null;
};

export type NicknameAvailability =
  | { available: true; nickname: string; is_current?: boolean }
  | { available: false; code: NicknameErrorCode };

/** Asks the server whether the username could be chosen now. */
export const checkNicknameAvailability = async (nickname: string): Promise<NicknameAvailability> => {
  const res = await axiosInstance.get<NicknameAvailability>(
    `${import.meta.env.VITE_BACKEND_API_URL}/players/nickname-availability`,
    { params: { nickname } }
  );
  return res.data;
};
