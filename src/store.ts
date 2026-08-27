import { configureStore } from '@reduxjs/toolkit'; // Import configureStore from Redux Toolkit
import authReducer, { saveAuthState } from './features/authSlice'; // Import the auth reducer and its persistence helper
import portfolioReducer, { saveActivePortfolio } from './features/portfolioSlice'; // Which portfolio is open

// Configure the Redux store with the auth and portfolio slice reducers
const store = configureStore({
  reducer: {
    auth: authReducer,           // Add auth reducer to the store
    portfolio: portfolioReducer, // Which of the user's portfolios is currently open
  },
});

// Persist both slices on every change. Each rehydrates itself from its own
// localStorage key on startup, so a reload keeps the user signed in and keeps
// them in the portfolio they were looking at.
store.subscribe(() => {
  saveAuthState(store.getState().auth);
  saveActivePortfolio(store.getState().portfolio);
});

// Export RootState type for use in typed selectors
export type RootState = ReturnType<typeof store.getState>;

export default store; // Export the configured store as default
