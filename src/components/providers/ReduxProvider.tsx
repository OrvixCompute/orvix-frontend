"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { Toaster } from "@/components/ui/Toast";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer />
      {children}
      <Toaster />
    </Provider>
  );
}
