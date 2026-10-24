/* ===========================================================================
   Following.
   ---------------------------------------------------------------------------
   One click, no approval, nothing about holdings revealed. Anyone can see how
   many followers a player has; only the player sees who they are, and whom
   they follow. Every change can earn game achievements for both players, so
   the caller asks the progression watcher to check afterwards.
   =========================================================================== */

import axiosInstance from "./axiosInstance";

const BASE = `${import.meta.env.VITE_BACKEND_API_URL}/players`;

export interface FollowState {
  following: boolean;
  followers: number;
  is_self: boolean;
}

export interface FollowListEntry {
  id: number;
  display_name: string;
  nickname: string | null;
  /** When the follow began. */
  since: string;
  /** Whether you follow this player (true for everyone in your Following list). */
  you_follow: boolean;
}

export const fetchFollowState = async (playerId: number): Promise<FollowState> =>
  (await axiosInstance.get<FollowState>(`${BASE}/${playerId}/follow`)).data;

export const followPlayer = async (playerId: number): Promise<FollowState> =>
  (await axiosInstance.put<FollowState>(`${BASE}/${playerId}/follow`)).data;

export const unfollowPlayer = async (playerId: number): Promise<FollowState> =>
  (await axiosInstance.delete<FollowState>(`${BASE}/${playerId}/follow`)).data;

export const fetchMyFollowing = async (): Promise<FollowListEntry[]> =>
  (await axiosInstance.get<{ players: FollowListEntry[] }>(`${BASE}/me/following`)).data.players;

export const fetchMyFollowers = async (): Promise<FollowListEntry[]> =>
  (await axiosInstance.get<{ players: FollowListEntry[] }>(`${BASE}/me/followers`)).data.players;
