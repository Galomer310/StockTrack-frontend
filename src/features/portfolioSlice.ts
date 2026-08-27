import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/* ===========================================================================
   Which portfolio you are currently inside.
   ---------------------------------------------------------------------------
   A user runs up to three books and switches between them in their personal
   area. That choice is context for the whole session rather than a property of
   any one screen, so it lives here and is mirrored into localStorage - coming
   back to the dashboard should put you where you left off, not always in the
   first portfolio.

   axiosInstance reads this and sends it as X-Portfolio-Id on every request, so
   a trade lands in the open book without every call site having to remember to
   pass it. The server still validates that the portfolio exists and is yours.
   =========================================================================== */

const STORAGE_KEY = 'stocktrack_active_portfolio';

export interface PortfolioState {
  activeId: number | null;
}

const loadActiveId = (): PortfolioState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? Number(raw) : NaN;
    return { activeId: Number.isInteger(parsed) && parsed > 0 ? parsed : null };
  } catch {
    // Reads can throw in private-browsing modes; fall back to "not chosen".
    return { activeId: null };
  }
};

export const saveActivePortfolio = (state: PortfolioState) => {
  try {
    if (state.activeId === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, String(state.activeId));
  } catch {
    // Persistence is best effort; a full or disabled store must not break the app.
  }
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState: loadActiveId(),
  reducers: {
    setActivePortfolio: (state, action: PayloadAction<number | null>) => {
      state.activeId = action.payload;
    },
    // Called on logout: the next person to sign in on this browser must not
    // inherit a pointer into someone else's portfolio.
    clearActivePortfolio: (state) => {
      state.activeId = null;
    },
  },
});

export const { setActivePortfolio, clearActivePortfolio } = portfolioSlice.actions;

export default portfolioSlice.reducer;
