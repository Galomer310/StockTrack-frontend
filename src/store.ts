import { configureStore } from '@reduxjs/toolkit'; // Import configureStore from Redux Toolkit
import authReducer, { saveAuthState } from './features/authSlice'; // Import the auth reducer and its persistence helper

// Configure the Redux store with the auth slice reducer
const store = configureStore({
  reducer: {
    auth: authReducer, // Add auth reducer to the store
  },
});

// Persist the auth slice on every change. The slice rehydrates itself from the
// same localStorage key on startup, so a reload keeps the user signed in and
// clearUser wipes the stored session.
store.subscribe(() => {
  saveAuthState(store.getState().auth);
});

// Export RootState type for use in typed selectors
export type RootState = ReturnType<typeof store.getState>;

export default store; // Export the configured store as default
