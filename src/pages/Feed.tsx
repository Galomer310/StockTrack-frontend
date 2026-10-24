import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { useLanguage } from "../i18n/LanguageContext";
import { MessageKey } from "../i18n/messages";
import { fill, ltr } from "../i18n/fill";

/* ===========================================================================
   The feed.
   ---------------------------------------------------------------------------
   Every buy and sell by every user, newest first, each one a post you can
   react to and reply to.

   No prices anywhere, including on your own posts: a post carries what was
   done, to which ticker, when, why, and how the stock has moved since. The
   server enforces that - this page could not show a price if it wanted to.

   Translated: the page lays out right to left in Hebrew. What people wrote
   (names, theses, replies, portfolio names) keeps its own direction, and the
   signed percentage stays left to right.
   =========================================================================== */

const PAGE_SIZE = 25;

// The reactions' names, by the key the server stores.
const REACTION_TITLES: Record<string, MessageKey> = {
  like: "reaction_like",
  dislike: "reaction_dislike",
  "🚀": "reaction_rocket",
  "🔥": "reaction_fire",
  "💎": "reaction_diamond",
  "😂": "reaction_funny",
  "😮": "reaction_surprised",
  "😢": "reaction_painful",
};

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
  const { t, dir, lang, locale } = useLanguage();

  // The reply box grows with what is typed, so a reply longer than one line
  // can be read back before posting - on a phone a one-line input showed only
  // the last few words. Measured before paint, so it never flickers. The CSS
  // caps the height; past that the box scrolls inside itself.
  const replyRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const box = replyRef.current;
    if (!box) return;
    box.style.height = "auto";
    // scrollHeight leaves out the border, which border-box sizing counts.
    const border = box.offsetHeight - box.clientHeight;
    box.style.height = `${box.scrollHeight + border}px`;
  }, [draft]);

  // Reacting is optimistic in neither direction: we send, then render whatever
  // tally comes back, so two people reacting at once cannot leave the count
  // wrong on either screen.
  const handleReact = async (reaction: string) => {
    try {
      const result = await react(post.id, reaction);
      onChanged({ ...post, reactions: result.reactions, my_reaction: result.my_reaction });
    } catch {
      toast.error(t("feed_react_failed"));
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
      // The server's reason is English, so Hebrew shows its own message.
      toast.error((lang === "en" && err.response?.data?.error) || t("feed_reply_failed"));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (c: FeedComment) => {
    try {
      await deleteComment(c.id);
      onChanged({ ...post, comments: post.comments.filter((x) => x.id !== c.id) });
    } catch {
      toast.error(t("feed_delete_failed"));
    }
  };

  // Long threads collapse to the last three, so one busy post cannot push the
  // rest of the timeline off the screen.
  const visibleComments =
    showAllComments || post.comments.length <= 3
      ? post.comments
      : post.comments.slice(-3);

  const moved = post.change_pct_since;
  const actionText = t(post.action === "buy" ? "trade_buy" : "trade_sell");

  return (
    <article className={`feed-post feed-${post.action}`}>
      <header className="feed-post-head">
        <div className="feed-avatar" aria-hidden="true">
          {post.user.display_name.charAt(0).toUpperCase()}
        </div>

        <div className="feed-byline">
          <span className="feed-author">
            <bdi>{post.user.display_name}</bdi>
            {post.is_mine && <span className="lb-you">{t("feed_you")}</span>}
            {/* Which book the trade was made in. The link goes to the
                portfolio, since that is the thing being ranked and viewed. */}
            {post.portfolio && (
              <Link className="feed-portfolio" to={`/investor/${post.portfolio.id}`}>
                <bdi>{post.portfolio.name}</bdi>
              </Link>
            )}
          </span>
          <span className="feed-action-line">
            <span className={`trade-badge trade-${post.action}`}>{actionText}</span>
            <Link className="ticker-link" to={`/stock/${post.stock_symbol}`}>
              {post.stock_symbol}
            </Link>
            {/* The date and time the action was taken. */}
            <time className="feed-time" dateTime={post.occurred_at}>
              {dateTime(post.occurred_at, locale)}
            </time>
            {post.backdated && (
              <span
                className="journal-backdated"
                title={fill(t("journal_written"), { date: dateTime(post.created_at, locale) })}
              >
                {t("journal_recorded_later")}
              </span>
            )}
          </span>
        </div>

        {/* How the stock has moved since the trade - the only figure on a post. */}
        <div
          className={`feed-move ${(moved ?? 0) >= 0 ? "gain" : "loss"}`}
          title={fill(t(post.action === "buy" ? "journal_move_title_buy" : "journal_move_title_sell"), {
            symbol: lang === "he" ? ltr(post.stock_symbol) : post.stock_symbol,
          })}
        >
          <bdi dir="ltr">{percentOrDash(moved)}</bdi>
          <span className="feed-move-label">{t("feed_since")}</span>
        </div>
      </header>

      <p className="feed-note" dir="auto">{post.note}</p>

      <div className="feed-reactions">
        {REACTIONS.map((r) => {
          const count = post.reactions[r.key] || 0;
          const mine = post.my_reaction === r.key;
          const title = t(REACTION_TITLES[r.key]);
          return (
            <button
              key={r.key}
              className={`reaction-chip${mine ? " is-mine" : ""}`}
              onClick={() => handleReact(r.key)}
              title={mine ? fill(t("reaction_undo"), { title }) : title}
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
                {fill(t("feed_show_all"), { n: post.comments.length })}
              </button>
            </li>
          )}
          {visibleComments.map((c) => (
            <li key={c.id} className="feed-comment">
              {/* The name is isolated inside the span, so the gap after it follows
                  the page's direction rather than the name's. */}
              <span className="feed-comment-author">
                <bdi>{c.user.display_name}</bdi>
              </span>
              <span className="feed-comment-body" dir="auto">{c.body}</span>
              <span className="feed-comment-meta">
                <time dateTime={c.created_at}>{dateTime(c.created_at, locale)}</time>
                {c.is_mine && (
                  <button
                    className="link-btn"
                    onClick={() => handleDeleteComment(c)}
                    title={t("feed_delete_title")}
                  >
                    {t("feed_delete")}
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <form className="feed-reply" onSubmit={handleComment}>
        <textarea
          ref={replyRef}
          rows={1}
          value={draft}
          maxLength={500}
          // Edge treats an empty dir="auto" box as left to right, which would
          // reverse a Hebrew placeholder, so it follows the page until typed in.
          dir={draft ? "auto" : dir}
          placeholder={t("feed_reply_placeholder")}
          aria-label={t("feed_reply_label")}
          onChange={(e) => setDraft(e.target.value)}
          // Enter still posts, as it did when this was a one-line input;
          // Shift+Enter starts a new line. Not while an input method is
          // composing, where Enter confirms the composed text instead.
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button type="submit" disabled={!draft.trim() || sending}>
          {sending ? t("feed_posting") : t("feed_reply")}
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
  const [error, setError] = useState<MessageKey | null>(null);
  const { t, dir, lang } = useLanguage();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const page = await fetchFeed(0, PAGE_SIZE);
        if (cancelled) return;
        setPosts(page.posts);
        setHasMore(page.has_more);
      } catch {
        if (!cancelled) setError("feed_failed");
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
      setError("feed_more_failed");
    } finally {
      setLoadingMore(false);
    }
  };

  // Replaces one post in place after a reaction or a reply, so the rest of the
  // timeline is left alone rather than being refetched.
  const replacePost = (updated: FeedPost) =>
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

  if (loading) return <div className="feed-page" dir={dir} lang={lang}><p>{t("feed_loading")}</p></div>;
  if (error) return <div className="feed-page" dir={dir} lang={lang}><p className="error">{t(error)}</p></div>;

  return (
    <div className="feed-page" dir={dir} lang={lang}>
      <h2>{t("feed_title")}</h2>
      <p className="feed-subtitle">{t("feed_subtitle")}</p>

      {posts.length === 0 ? (
        <p className="stock-empty">{t("feed_empty")}</p>
      ) : (
        <div className="feed-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onChanged={replacePost} />
          ))}
        </div>
      )}

      {hasMore && (
        <button className="feed-more-btn" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? t("loading") : t("feed_load_older")}
        </button>
      )}
    </div>
  );
};

export default Feed;
