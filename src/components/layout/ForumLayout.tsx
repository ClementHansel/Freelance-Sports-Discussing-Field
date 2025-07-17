"use client";

import React from "react";
import { RedirectHandler } from "@/components/RedirectHandler";
import { ForumHeader } from "./ForumHeader";
import { ForumSidebarNav } from "./ForumSidebarNav";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface ForumLayoutProps {
  children: React.ReactNode;
}

export const ForumLayout = ({ children }: ForumLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-16">
      <RedirectHandler />
      <ForumHeader />

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6 overflow-x-hidden">
        <div className="flex gap-6 w-full">
          {/* Sidebar - Left side on desktop, hidden on mobile */}
          {!isMobile && (
            <aside className="w-80 flex-shrink-0 space-y-6 overflow-x-hidden">
              <ForumSidebarNav />
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 w-full overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};
