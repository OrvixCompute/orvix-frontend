import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  title?: string;
  variant: ToastVariant;
  /** Auto-dismiss delay in ms; 0 keeps the toast until dismissed. */
  duration: number;
}

interface UiState {
  mobileNavOpen: boolean;
  toasts: Toast[];
}

const initialState: UiState = {
  mobileNavOpen: false,
  toasts: [],
};

let nextToastId = 0;

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMobileNavOpen(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload;
    },
    toggleMobileNav(state) {
      state.mobileNavOpen = !state.mobileNavOpen;
    },
    addToast: {
      reducer(state, action: PayloadAction<Toast>) {
        state.toasts.push(action.payload);
      },
      prepare(input: {
        message: string;
        title?: string;
        variant?: ToastVariant;
        duration?: number;
      }) {
        return {
          payload: {
            id: `toast-${nextToastId++}`,
            message: input.message,
            title: input.title,
            variant: input.variant ?? "info",
            duration: input.duration ?? 4000,
          },
        };
      },
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { setMobileNavOpen, toggleMobileNav, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
