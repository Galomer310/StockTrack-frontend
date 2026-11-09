import axiosInstance from "./axiosInstance";
import { DailyRewards } from "./dailyRewards";

/* ===========================================================================
   The test player's tools (backend src/testTools). Only the account listed
   in the server's TEST_PLAYER_EMAILS may use them; for anyone else every
   call answers 404 (never 403, which this client treats as an expired
   token), and the panel stays hidden.
   =========================================================================== */

const BASE = `${import.meta.env.VITE_BACKEND_API_URL}/test-tools`;

export interface TesterState {
  email: string;
  nickname: string | null;
  nickname_locked: boolean;
  xp: { total: number; from_tests: number };
  level: number | null;
  thresholds_configured: boolean;
  achievements: { unlocked: number; notices_pending: number };
  ceremonies_pending: number;
  portfolios: number;
  daily: DailyRewards;
}

/** The state, or null when this account is not a tester. */
export const fetchTesterState = async (): Promise<TesterState | null> => {
  try {
    return (await axiosInstance.get<TesterState>(`${BASE}/state`)).data;
  } catch (err) {
    if ((err as { response?: { status?: number } })?.response?.status === 404) return null;
    throw err;
  }
};

export class ToolError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export const runTool = async <T = unknown>(path: string, body: object = {}): Promise<T> => {
  try {
    return (await axiosInstance.post<T>(`${BASE}${path}`, body)).data;
  } catch (err) {
    const data = (err as { response?: { data?: { code?: string; error?: string } } })?.response?.data;
    throw new ToolError(data?.code ?? "UNKNOWN", data?.error ?? "The tool failed.");
  }
};
