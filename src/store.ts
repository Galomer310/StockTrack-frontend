import { configureStore } from '@reduxjs/toolkit'; // Import configureStore from Redux Toolkit
import authReducer from './features/authSlice'; // Import the auth reducer

// Configure the Redux store with the auth slice reducer
const store = configureStore({
  reducer: {
    auth: authReducer, // Add auth reducer to the store
  },
});

// Export RootState type for use in typed selectors
export type RootState = ReturnType<typeof store.getState>;

export default store; // Export the configured store as default
