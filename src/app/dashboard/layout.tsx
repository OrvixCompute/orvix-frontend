"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { cn } from "@/lib/utils/cn";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-bg-primary">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-border md:block">
          <div className="sticky top-0 h-screen">
            <Sidebar />
          </div>
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />
            <div
              className={cn(
                "absolute left-0 top-0 h-full w-64 border-r border-border bg-bg-primary",
              )}
            >
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-4 text-text-secondary hover:text-text-primary"
              >
                <X size={18} />
              </button>
              <Sidebar onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        )}

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setDrawerOpen(true)} />
          <main className="mx-auto w-full max-w-page flex-1 px-4 py-8 md:px-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
