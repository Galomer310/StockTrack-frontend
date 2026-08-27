import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchFeed,
  react,
  comment as postComment,
  deleteComment,
  FeedPost,
  FeedComment,
  REACTIONS,
} from "../api/feed";
import { percentOrDash, dateTime } from "../api/social";
import { useToast } from "../components/ui/ToastProvider";

/* ===========================================================================
   The feed.
   ---------------------------------------------------------------------------
   Every buy and sell by every user, newest first, each one a post you can
   react to and reply to.

   No prices anywhere, including on your own posts: a post carries what was
   done, to which ticker, when, why, and how the stock has moved since. The
   server enforces that - this page could not show a price if it wanted to.
   =========================================================================== */

const PAGE_SIZE = 25;

// A single post.
const PostCard = ({
  post,
  onChanged,
}: {
  post: FeedPost;
  onChanged: (updated: FeedPost) => void;
}) => {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const toast = useToast();

  // Reacting is optimistic in neither direction: we send, then render whatever
  // tally comes back, so two people reacting at once cannot leave the count
  // wrong on either screen.
  const handleReact = async (reaction: string) => {
    try {
      const result = await react(post.id, reaction);
      onChanged({ ...post, reactions: result.reactions, my_reaction: result.my_reaction });
    } catch {
      toast.error("Could not save your reaction.");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const created = await postComment(post.id, body);
      onChanged({ ...post, comments: [...post.comments, created] });
      setDraft("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Could not post your reply.");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (c: FeedComment) => {
    try {
      await deleteComment(c.id);
      onChanged({ ...post, comments: post.comments.filter((x) => x.id !== c.id) });
    } catch {
      toast.error("Could not delete that reply.");
    }
  };

  // Long threads collapse to the last three, so one busy post cannot push the
  // rest of the timeline off the screen.
  const visibleComments =
    showAllComments || post.comments.length <= 3
      ? post.comments
      : post.comments.slice(-3);

  const moved = post.change_pct_since;

  return (
    <article className={`feed-post feed-${post.action}`}>
      <header className="feed-post-head">
        <div className="feed-avatar" aria-hidden="true">
          {post.user.display_name.charAt(0).toUpperCase()}
        </div>

        <div className="feed-byline">
          <span className="feed-author">
            {post.user.display_name}
            {post.is_mine && <span className="lb-you">you</span>}
            {/* Which book the trade was made in. The link goes to the
                portfolio, since that is the thing being ranked and viewed. */}
            {post.portfolio && (
              <Link className="feed-portfolio" to={`/investor/${post.portfolio.id}`}>
                {post.portfolio.name}
              </Link>
            )}
          </span>
          <span className="feed-action-line">
            <span className={`trade-badge trade-${post.action}`}>{post.action}</span>
            <Link className="ticker-link" to={`/stock/${post.stock_symbol}`}>
              {post.stock_symbol}
            </Link>
            {/* The date and time the action was taken. */}
            <time className="feed-time" dateTime={post.occurred_at}>
              {dateTime(post.occurred_at)}
            </time>
            {post.backdated && (
              <span className="journal-backdated" title={`Written ${dateTime(post.created_at)}`}>
                recorded later
              </span>
            )}
          </span>
        </div>

        {/* How the stock has moved since the trade - the only figure on a post. */}
        <div
          className={`feed-move ${(moved ?? 0) >= 0 ? "gain" : "loss"}`}
          title={`Move in ${post.stock_symbol} since this ${post.action}`}
        >
          {percentOrDash(moved)}
          <span className="feed-move-label">since</span>
        </div>
      </header>

      <p className="feed-note">{post.note}</p>

      <div className="feed-reactions">
        {REACTIONS.map((r) => {
          const count = post.reactions[r.key] || 0;
          const mine = post.my_reaction === r.key;
          return (
            <button
              key={r.key}
              className={`reaction-chip${mine ? " is-mine" : ""}`}
              onClick={() => handleReact(r.key)}
              title={mine ? `${r.title} — tap to undo` : r.title}
              aria-pressed={mine}
            >
              <span className="reaction-emoji">{r.label}</span>
              {count > 0 && <span className="reaction-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {post.comments.length > 0 && (
        <ul className="feed-comments">
          {!showAllComments && post.comments.length > 3 && (
            <li className="feed-more">
              <button className="link-btn" onClick={() => setShowAllComments(true)}>
                Show all {post.comments.length} replies
              </button>
            </li>
          )}
          {visibleComments.map((c) => (
            <li key={c.id} className="feed-comment">
              <span className="feed-comment-author">{c.user.display_name}</span>
              <span className="feed-comment-body">{c.body}</span>
              <span className="feed-comment-meta">
                <time dateTime={c.created_at}>{dateTime(c.created_at)}</time>
                {c.is_mine && (
                  <button
                    className="link-btn"
                    onClick={() => handleDeleteComment(c)}
                    title="Delete your reply"
                  >
                    delete
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <form className="feed-reply" onSubmit={handleComment}>
        <input
          type="text"
          value={draft}
          maxLength={500}
          placeholder="Write a reply…"
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" disabled={!draft.trim() || sending}>
          {sending ? "Posting…" : "Reply"}
        </button>
      </form>
    </article>
  );
};

const Feed = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const page = await fetchFeed(0, PAGE_SIZE);
        if (cancelled) return;
        setPosts(page.posts);
        setHasMore(page.has_more);
      } catch {
        if (!cancelled) setError("Could not load the feed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const page = await fetchFeed(posts.length, PAGE_SIZE);
      setPosts((prev) => [...prev, ...page.posts]);
      setHasMore(page.has_more);
    } catch {
      setError("Could not load more posts.");
    } finally {
      setLoadingMore(false);
    }
  };

  // Replaces one post in place after a reaction or a reply, so the rest of the
  // timeline is left alone rather than being refetched.
  const replacePost = (updated: FeedPost) =>
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

  if (loading) return <div className="feed-page"><p>Loading feed…</p></div>;
  if (error) return <div className="feed-page"><p className="error">{error}</p></div>;

  return (
    <div className="feed-page">
      <h2>Feed</h2>
      <p className="feed-subtitle">
        Every buy and sell as it happens, from everyone. Percentages only — what
        each investor paid stays their own business.
      </p>

      {posts.length === 0 ? (
        <p className="stock-empty">
          Nothing here yet. The moment anyone buys or sells, it appears here.
        </p>
      ) : (
        <div className="feed-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onChanged={replacePost} />
          ))}
        </div>
      )}

      {hasMore && (
        <button className="feed-more-btn" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? "Loading…" : "Load older posts"}
        </button>
      )}
    </div>
  );
};

export default Feed;
