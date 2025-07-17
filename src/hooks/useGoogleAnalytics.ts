"use client";

import { useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useForumSettings } from "@/hooks/useForumSettings";
import { useCookieConsent } from "@/hooks/useCookieConsent";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer?: any[];
  }
}

export const useGoogleAnalytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { getSetting } = useForumSettings();
  const { hasConsent } = useCookieConsent();
  const trackingId = getSetting("google_analytics_id", "");
  const canTrack = hasConsent("analytics") && trackingId;

  const buildPagePath = useCallback(() => {
    const search = searchParams?.toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [pathname, searchParams]);

  const trackPageView = useCallback(
    (customTitle?: string) => {
      if (!canTrack || !window.gtag) return;

      const title = customTitle || document.title;
      const pagePath = buildPagePath();

      window.gtag("config", trackingId, {
        page_title: title,
        page_location: window.location.href,
        page_path: pagePath,
        custom_map: {
          dimension1: user ? "authenticated" : "anonymous",
          dimension2: user?.role || "user",
        },
      });

      window.gtag("event", "page_view", {
        page_title: title,
        page_location: window.location.href,
        page_path: pagePath,
        user_type: user ? "authenticated" : "anonymous",
        user_role: user?.role || "user",
      });
    },
    [canTrack, trackingId, buildPagePath, user]
  );

  const trackEvent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (eventName: string, parameters: Record<string, any> = {}) => {
      if (!canTrack || !window.gtag) return;

      window.gtag("event", eventName, {
        ...parameters,
        user_type: user ? "authenticated" : "anonymous",
        user_role: user?.role || "user",
        timestamp: new Date().toISOString(),
      });
    },
    [canTrack, user]
  );

  const trackSearch = useCallback(
    (query: string, resultsCount: number) => {
      trackEvent("search", {
        search_term: query,
        results_count: resultsCount,
      });
    },
    [trackEvent]
  );

  const trackContentCreation = useCallback(
    (type: "topic" | "post", categoryId?: string) => {
      trackEvent("content_create", {
        content_type: type,
        category_id: categoryId,
      });
    },
    [trackEvent]
  );

  const trackUserAction = useCallback(
    (action: "login" | "register" | "logout") => {
      trackEvent("user_action", {
        action_type: action,
      });
    },
    [trackEvent]
  );

  const trackNavigation = useCallback(
    (
      fromPath: string,
      toPath: string,
      method: "click" | "direct" = "click"
    ) => {
      trackEvent("navigation", {
        from_path: fromPath,
        to_path: toPath,
        navigation_method: method,
      });
    },
    [trackEvent]
  );

  const trackError = useCallback(
    (error: string, context?: string) => {
      trackEvent("error", {
        error_message: error,
        error_context: context || "unknown",
      });
    },
    [trackEvent]
  );

  const trackPerformance = useCallback(
    (metric: string, value: number, unit: string = "ms") => {
      trackEvent("performance", {
        metric_name: metric,
        metric_value: value,
        metric_unit: unit,
      });
    },
    [trackEvent]
  );

  return {
    trackPageView,
    trackEvent,
    trackSearch,
    trackContentCreation,
    trackUserAction,
    trackNavigation,
    trackError,
    trackPerformance,
    isTrackingEnabled: canTrack,
  };
};
