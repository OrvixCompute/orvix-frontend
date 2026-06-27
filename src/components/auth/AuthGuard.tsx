"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { loadAuth } from "@/lib/auth/storage";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Client-side route protection. Middleware can't read the JWT (it lives in
 * localStorage, not a cookie), so we gate here:
 *  - redux authenticated         -> render children
 *  - persisted auth still loading -> skeleton (AuthInitializer is rehydrating)
 *  - nothing persisted           -> redirect home
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !loadAuth()) {
      router.replace("/?signin=1");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    // Restoring from storage, or about to redirect.
    return loadAuth() ? <DashboardSkeleton /> : null;
  }

  return <>{children}</>;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-8">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
