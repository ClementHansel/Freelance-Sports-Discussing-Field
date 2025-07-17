"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useGoogleAnalytics } from "./useGoogleAnalytics";

export const useRouteTracking = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackPageView, trackNavigation } = useGoogleAnalytics();

  const previousPath = useRef<string>(pathname + "?" + searchParams.toString());

  useEffect(() => {
    const currentFullPath = pathname + "?" + searchParams.toString();
    const previousFullPath = previousPath.current;

    if (currentFullPath !== previousFullPath) {
      trackNavigation(previousFullPath, currentFullPath, "click");
    }

    trackPageView(document.title);
    previousPath.current = currentFullPath;
  }, [pathname, searchParams, trackPageView, trackNavigation]);

  return {
    currentPath: pathname,
    previousPath: previousPath.current,
  };
};
