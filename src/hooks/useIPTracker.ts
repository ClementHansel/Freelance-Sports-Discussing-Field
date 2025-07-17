"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/components/integrations/supabase/client";
import { getUserIP, getIPGeolocation } from "@/utils/ipUtils";
import { sessionManager } from "@/utils/sessionManager";

export const useIPTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const trackPageVisit = async () => {
      try {
        const ip = await getUserIP();
        const sessionId = sessionManager.getSessionId();

        if (!ip || !sessionId) return;

        const geoData = await getIPGeolocation(ip);

        if (geoData?.is_vpn && pathname !== "/vpn-blocked") {
          console.log(
            "🚨 BACKUP VPN DETECTION: Blocking VPN user at IP tracking level"
          );
          window.location.href = "/vpn-blocked";
          return;
        }

        const pathParts = pathname.split("/");
        let categoryId: string | null = null;
        let topicId: string | null = null;

        if (pathParts[1] === "c" && pathParts[2]) {
          const { data: category } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", pathParts[2])
            .single();
          categoryId = category?.id;
        } else if (pathParts[1] === "t" && pathParts[2]) {
          const { data: topic } = await supabase
            .from("topics")
            .select("id, category_id")
            .eq("slug", pathParts[2])
            .single();
          topicId = topic?.id;
          categoryId = topic?.category_id;
        }

        const searchQuery = searchParams.get("q") || searchParams.get("search");

        const pagePath = searchParams.toString()
          ? `${pathname}?${searchParams.toString()}`
          : pathname;

        if (geoData) {
          await supabase.rpc("log_page_visit_with_geolocation", {
            p_ip_address: ip,
            p_session_id: sessionId,
            p_page_path: pagePath,
            p_page_title: document.title,
            p_referrer: document.referrer || null,
            p_user_agent: navigator.userAgent,
            p_search_query: searchQuery,
            p_category_id: categoryId,
            p_topic_id: topicId,
            p_country_code: geoData.country_code,
            p_country_name: geoData.country_name,
            p_city: geoData.city,
            p_region: geoData.region,
            p_latitude: geoData.latitude,
            p_longitude: geoData.longitude,
            p_timezone: geoData.timezone,
            p_is_vpn: geoData.is_vpn,
            p_is_proxy: geoData.is_proxy,
            p_isp: geoData.isp,
          });
        } else {
          await supabase.rpc("log_page_visit", {
            p_ip_address: ip,
            p_session_id: sessionId,
            p_page_path: pagePath,
            p_page_title: document.title,
            p_referrer: document.referrer || null,
            p_user_agent: navigator.userAgent,
            p_search_query: searchQuery,
            p_category_id: categoryId,
            p_topic_id: topicId,
          });
        }
      } catch (error) {
        console.error("Failed to track page visit:", error);
      }
    };

    trackPageVisit();
  }, [pathname, searchParams]);

  const logActivity = async (
    activityType: string,
    contentId?: string,
    contentType?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actionData?: any,
    isBlocked = false,
    blockedReason?: string
  ) => {
    try {
      const ip = await getUserIP();
      const sessionId = sessionManager.getSessionId();

      if (!ip || !sessionId) return;

      await supabase.rpc("log_ip_activity", {
        p_ip_address: ip,
        p_session_id: sessionId,
        p_activity_type: activityType,
        p_content_id: contentId || null,
        p_content_type: contentType || null,
        p_action_data: actionData || null,
        p_is_blocked: isBlocked,
        p_blocked_reason: blockedReason || null,
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  return { logActivity };
};
