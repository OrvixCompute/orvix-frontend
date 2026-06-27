import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface WalletState {
  address: string | null;
  connected: boolean;
}

const initialState: WalletState = {
  address: null,
  connected: false,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWallet(state, action: PayloadAction<{ address: string | null; connected: boolean }>) {
      state.address = action.payload.address;
      state.connected = action.payload.connected;
    },
  },
});

export const { setWallet } = walletSlice.actions;
export default walletSlice.reducer;
