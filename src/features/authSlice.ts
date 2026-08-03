import { createSlice, PayloadAction } from '@reduxjs/toolkit'; // Import createSlice and PayloadAction from Redux Toolkit

// Key under which the auth slice is mirrored into localStorage, so that a page
// refresh does not drop the session and bounce the user back to /login.
const STORAGE_KEY = 'stocktrack_auth';

// Define the state interface for authentication
export interface AuthState {
  user: { id: number; email: string } | null; // User object or null if not logged in
  accessToken: string | null; // Access token for authenticated requests or null if not available
  refreshToken: string | null; // Refresh token for renewing access tokens
}

// The logged-out state, used both as a fallback and after clearUser
const emptyState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

// Read a previously persisted session. Anything malformed or partial is
// discarded, so a corrupt entry can never wedge the app on startup.
const loadAuthState = (): AuthState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw);
    if (!parsed?.user?.id || !parsed?.user?.email || !parsed?.accessToken) {
      return emptyState;
    }
    return {
      user: { id: parsed.user.id, email: parsed.user.email },
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken ?? null,
    };
  } catch {
    // Reads can throw in private-browsing modes; fall back to logged out.
    return emptyState;
  }
};

// Mirror the current auth slice into localStorage. Called from the store
// subscription in store.ts, so every setUser/clearUser is captured for free.
export const saveAuthState = (state: AuthState) => {
  try {
    if (!state.user || !state.accessToken) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence is best effort; a full or disabled store must not break login.
  }
};

// Create the auth slice using createSlice
const authSlice = createSlice({
  name: 'auth',         // Name of the slice
  initialState: loadAuthState(), // Rehydrate from localStorage on startup
  reducers: {           // Reducers to modify the state
    setUser: (state, action: PayloadAction<{ user: { id: number; email: string }; accessToken: string; refreshToken: string }>) => {
      state.user = action.payload.user;          // Set the user data from the action payload
      state.accessToken = action.payload.accessToken;  // Set the access token from the action payload
      state.refreshToken = action.payload.refreshToken; // Set the refresh token from the action payload
    },
    clearUser: (state) => {
      state.user = null;        // Clear the user data
      state.accessToken = null; // Clear the access token
      state.refreshToken = null; // Clear the refresh token so no stale token is left behind
    },
  },
});

// Export the actions so they can be dispatched from components
export const { setUser, clearUser } = authSlice.actions;

// Export the reducer to be added to the store
export default authSlice.reducer;
