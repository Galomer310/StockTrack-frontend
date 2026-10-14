import React, { useEffect, useRef, useState } from "react";

/* ===========================================================================
   The note window shown for every buy and sell.
   ---------------------------------------------------------------------------
   A note is required: the journal is public, and an entry with no reasoning
   behind it is worth little to anyone reading it. The backend enforces the
   same rule, so this is convenience rather than the actual guard.
   =========================================================================== */

export interface TradeSubmission {
  note: string;
  quantity: number;
  price: number;
}

interface Props {
  open: boolean;
  mode: "buy" | "sell";
  symbol: string;
  /** Shares held, used as the ceiling when selling */
  maxQuantity?: number;
  /** Prefilled quantity and price */
  defaultQuantity?: number;
  defaultPrice?: number;
  onClose: () => void;
  onSubmit: (submission: TradeSubmission) => Promise<void>;
}

const PROMPTS: Record<"buy" | "sell", string> = {
  buy: "Why are you buying? What has to go right for this to work?",
  sell: "Why are you selling? Did the thesis play out, break, or change?",
};

const TradeNoteModal: React.FC<Props> = ({
  open,
  mode,
  symbol,
  maxQuantity,
  defaultQuantity = 1,
  defaultPrice = 0,
  onClose,
  onSubmit,
}) => {
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [price, setPrice] = useState(defaultPrice);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const noteRef = useRef<HTMLTextAreaElement>(null);

  // Reset each time it opens, so a previous thesis never leaks into a new trade
  useEffect(() => {
    if (!open) return;
    setNote("");
    setQuantity(defaultQuantity);
    setPrice(defaultPrice);
    setError("");
    // Focus the note, since that is the point of the window
    const timer = window.setTimeout(() => noteRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [open, defaultQuantity, defaultPrice]);

  // Escape closes; the page behind must not scroll while it is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("nav-locked");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("nav-locked");
    };
  }, [open, submitting, onClose]);

  if (!open) return null;

  const trimmed = note.trim();
  const overQuantity = mode === "sell" && maxQuantity !== undefined && quantity > maxQuantity;
  const canSubmit =
    trimmed.length > 0 && quantity >= 1 && price > 0 && !overQuantity && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await onSubmit({ note: trimmed, quantity, price });
    } catch (err: any) {
      setError(err?.response?.data?.error || "Could not record this trade.");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
  };

  const total = quantity * price;

  return (
    <div
      className="modal-backdrop"
      onClick={() => !submitting && onClose()}
      role="presentation"
    >
      <div
        className="modal trade-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="trade-modal-title"
      >
        <div className="modal-head">
          <span className={`trade-badge trade-${mode}`}>{mode}</span>
          <h3 id="trade-modal-title">
            {mode === "buy" ? "Record purchase" : "Record sale"} · {symbol}
          </h3>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="trade-fields">
            <label>
              <span className="summary-label">Quantity</span>
              <input
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={mode === "buy"}
                required
              />
              {mode === "sell" && maxQuantity !== undefined && (
                <span className="field-hint">
                  {maxQuantity} held
                  {maxQuantity > 1 && (
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setQuantity(maxQuantity)}
                    >
                      sell all
                    </button>
                  )}
                </span>
              )}
            </label>

            <label>
              <span className="summary-label">
                {mode === "buy" ? "Price paid" : "Sale price"}
              </span>
              {/* Read-only both ways: the server executes every trade at its
                  own market quote, so this is the price shown, not chosen. */}
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                disabled
                required
              />
            </label>

            <div className="trade-total">
              <span className="summary-label">Total</span>
              <span className="summary-value">${total.toFixed(2)}</span>
            </div>
          </div>

          {overQuantity && (
            <p className="error">You only hold {maxQuantity} shares of {symbol}.</p>
          )}

          <label className="trade-note-field">
            <span className="summary-label">Your thesis (required)</span>
            <textarea
              ref={noteRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={PROMPTS[mode]}
              rows={5}
              maxLength={2000}
              required
            />
            <span className="field-hint">
              Visible to anyone who can view your portfolio · {note.length}/2000
            </span>
          </label>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" disabled={!canSubmit}>
              {submitting
                ? "Recording…"
                : mode === "buy"
                ? "Record purchase"
                : "Record sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeNoteModal;
