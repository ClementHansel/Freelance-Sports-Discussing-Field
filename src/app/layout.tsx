// src/app/layout.tsx

import "@/styles/globals.css";
import type { Metadata } from "next";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { MetadataProvider } from "@/components/seo/MetadataProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { OnlineUsersProvider } from "@/contexts/OnlineUsersContext";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { EnhancedHeaderCodeInjector } from "@/components/analytics/EnhancedHeaderCodeInjector";
import { CookieConsent } from "@/components/cookies/CookieConsent";
import { CookieDebugPanel } from "@/components/cookies/CookieDebugPanel";
import { MaintenanceWrapper } from "@/components/MaintenanceWrapper";
import { StickyBanner } from "@/components/ads/StickyBanner";
import { IPTrackingWrapper } from "@/components/IPTrackingWrapper";
import { VPNGuard } from "@/components/VPNGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Minor Hockey Talks",
  description:
    "A respectful community to discuss minor hockey topics, stories, and updates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <TooltipProvider>
            <Suspense>
              <AuthProvider>
                <OnlineUsersProvider>
                  <StickyBanner />
                  <EnhancedHeaderCodeInjector />
                  <CookieConsent />
                  <Toaster />
                  <Sonner />
                  <AnalyticsProvider>
                    <IPTrackingWrapper>
                      <CookieDebugPanel />
                      <ScrollToTop />
                      <MetadataProvider>
                        <MaintenanceWrapper>
                          <ErrorBoundary>
                            <VPNGuard>{children}</VPNGuard>
                          </ErrorBoundary>
                        </MaintenanceWrapper>
                      </MetadataProvider>
                    </IPTrackingWrapper>
                  </AnalyticsProvider>
                </OnlineUsersProvider>
              </AuthProvider>
            </Suspense>
          </TooltipProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
