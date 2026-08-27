// The shared feed: everyone's buys and sells, with reactions and replies.
import axiosInstance from "./axiosInstance";

const BASE = `${import.meta.env.VITE_BACKEND_API_URL}/feed`;

// The reactions the server accepts. Anything else is rejected, so this list and
// the ALLOWED_REACTIONS allowlist in feedController must stay in step.
export const REACTIONS = [
  { key: "like", label: "👍", title: "Like" },
  { key: "dislike", label: "👎", title: "Dislike" },
  { key: "🚀", label: "🚀", title: "To the moon" },
  { key: "🔥", label: "🔥", title: "Hot" },
  { key: "💎", label: "💎", title: "Diamond hands" },
  { key: "😂", label: "😂", title: "Funny" },
  { key: "😮", label: "😮", title: "Surprising" },
  { key: "😢", label: "😢", title: "Painful" },
] as const;

export interface FeedComment {
  id: number;
  user: { id: number; display_name: string };
  body: string;
  created_at: string;
  is_mine: boolean;
}

// One post. Note what is absent: no price and no quantity, on your own posts
// as well as everyone else's. The feed is public, so it carries the decision
// and how it has aged, not the size of the cheque.
export interface FeedPost {
  id: number;
  user: { id: number; display_name: string };
  is_mine: boolean;
  /** Which of the user's books the trade was made in */
  portfolio: { id: number; name: string } | null;
  action: "buy" | "sell";
  stock_symbol: string;
  note: string;
  occurred_at: string;
  created_at: string;
  backdated: boolean;
  change_pct_since: number | null;
  reactions: Record<string, number>;
  my_reaction: string | null;
  comments: FeedComment[];
}

export interface FeedPage {
  posts: FeedPost[];
  has_more: boolean;
}

export const fetchFeed = async (offset = 0, limit = 25): Promise<FeedPage> => {
  const res = await axiosInstance.get(`${BASE}?limit=${limit}&offset=${offset}`);
  return res.data;
};

// Sets your reaction. Sending the one you already hold clears it, so the same
// call covers reacting and un-reacting. Returns the server's fresh tally.
export const react = async (
  postId: number,
  reaction: string
): Promise<{ reactions: Record<string, number>; my_reaction: string | null }> => {
  const res = await axiosInstance.post(`${BASE}/${postId}/reactions`, { reaction });
  return res.data;
};

export const comment = async (postId: number, body: string): Promise<FeedComment> => {
  const res = await axiosInstance.post(`${BASE}/${postId}/comments`, { body });
  return res.data.comment;
};

export const deleteComment = async (commentId: number): Promise<void> => {
  await axiosInstance.delete(`${BASE}/comments/${commentId}`);
};
