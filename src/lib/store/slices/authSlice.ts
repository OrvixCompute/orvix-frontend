import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/lib/types/orvix";

interface AuthState {
  token: string | null;
  user: User | null;
  /** Epoch millis when the JWT expires. */
  expiresAt: number | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  expiresAt: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{ token: string; user: User; expiresAt: number | null }>,
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.expiresAt = action.payload.expiresAt;
    },
    clearAuth(state) {
      state.token = null;
      state.user = null;
      state.expiresAt = null;
    },
    updateBalance(state, action: PayloadAction<string>) {
      if (state.user) state.user.balance_usdc = action.payload;
    },
    updateTier(state, action: PayloadAction<string>) {
      if (state.user) state.user.tier = action.payload;
    },
  },
});

export const { setAuth, clearAuth, updateBalance, updateTier } = authSlice.actions;
export default authSlice.reducer;
