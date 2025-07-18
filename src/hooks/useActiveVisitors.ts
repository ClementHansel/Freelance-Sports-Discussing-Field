import { supabase } from "@/components/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface ActiveVisitor {
  ip_address: string;
  country_code: string;
  country_name: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  current_page: string;
  session_start: string;
  last_activity: string;
  total_pages: number;
  is_vpn: boolean;
}

export interface GeographicSummary {
  country_code: string;
  country_name: string;
  visitor_count: number;
  page_views: number;
  avg_session_duration: string;
}

export const useActiveVisitors = () => {
  return useQuery({
    queryKey: ["active-visitors"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_active_visitors");

      if (error) throw error;
      return data as ActiveVisitor[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });
};

export const useGeographicSummary = (hoursBack: number = 24) => {
  return useQuery({
    queryKey: ["geographic-summary", hoursBack],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_visitor_geographic_summary",
        {
          p_hours_back: hoursBack,
        }
      );

      if (error) throw error;
      return data as GeographicSummary[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useRealtimeVisitorUpdates = (
  onVisitorUpdate: (visitors: ActiveVisitor[]) => void
) => {
  // Set up real-time subscription for visitor updates
  const subscription = supabase
    .channel("visitor-updates")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "ip_visit_tracking",
      },
      async (payload) => {
        console.log("New visitor activity:", payload);
        // Trigger refetch of active visitors
        // This will be handled by the query invalidation
        // Fetch updated list of active visitors

        const { data, error } = await supabase.rpc("get_active_visitors");

        if (!error && data) {
          onVisitorUpdate(data as ActiveVisitor[]);
        } else {
          console.error("Failed to fetch updated visitors", error);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};
