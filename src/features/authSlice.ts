import { createSlice, PayloadAction } from '@reduxjs/toolkit'; // Import createSlice and PayloadAction from Redux Toolkit

// Define the state interface for authentication
interface AuthState {
  user: { id: number; email: string } | null; // User object or null if not logged in
  accessToken: string | null; // Access token for authenticated requests or null if not available
}

// Set the initial state for authentication
const initialState: AuthState = {
  user: null,         // No user initially
  accessToken: null,  // No access token initially
};

// Create the auth slice using createSlice
const authSlice = createSlice({
  name: 'auth',         // Name of the slice
  initialState,         // Initial state defined above
  reducers: {           // Reducers to modify the state
    setUser: (state, action: PayloadAction<{ user: { id: number; email: string }; accessToken: string }>) => {
      state.user = action.payload.user;          // Set the user data from the action payload
      state.accessToken = action.payload.accessToken;  // Set the access token from the action payload
    },
    clearUser: (state) => {
      state.user = null;        // Clear the user data
      state.accessToken = null; // Clear the access token
    },
  },
});

// Export the actions so they can be dispatched from components
export const { setUser, clearUser } = authSlice.actions;

// Export the reducer to be added to the store
export default authSlice.reducer;
