"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { setAuth } from "@/lib/store/slices/authSlice";
import { loadAuth } from "@/lib/auth/storage";

/**
 * Rehydrate auth from localStorage on first client mount. Runs in an effect (not
 * in the slice's initialState) so server and client render the same unauth'd
 * markup — no hydration mismatch.
 */
export function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const stored = loadAuth();
    if (stored) {
      dispatch(
        setAuth({ token: stored.token, user: stored.user, expiresAt: stored.expiresAt }),
      );
    }
  }, [dispatch]);

  return null;
}
