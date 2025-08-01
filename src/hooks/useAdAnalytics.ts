import { supabase } from "@/components/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Define a strict type to avoid nulls
type Totals = {
  impressions: number;
  clicks: number;
  revenue: number;
};

export interface AdAnalyticsData {
  ad_space_id: string;
  ad_space_name: string;
  impressions: number;
  clicks: number;
  revenue: number;
  ctr: number;
  date: string;
}

export interface AdAnalyticsSummary {
  total_impressions: number;
  total_clicks: number;
  total_revenue: number;
  average_ctr: number;
  impressions_growth: number;
  clicks_growth: number;
  revenue_growth: number;
  ctr_growth: number;
}

export const useAdAnalytics = (
  dateRange: "today" | "week" | "month" = "month"
) => {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["adAnalyticsSummary", dateRange],
    queryFn: async () => {
      const dateFilter = getDateFilter(dateRange);
      const previousDateFilter = getPreviousDateFilter(dateRange);

      // Get current period data
      const { data: currentData, error: currentError } = await supabase
        .from("ad_analytics")
        .select(
          `
          impressions,
          clicks,
          revenue
        `
        )
        .gte("date", dateFilter);

      if (currentError) throw currentError;

      // Get previous period data for comparison
      const { data: previousData, error: previousError } = await supabase
        .from("ad_analytics")
        .select(
          `
          impressions,
          clicks,
          revenue
        `
        )
        .gte("date", previousDateFilter)
        .lt("date", dateFilter);

      if (previousError) throw previousError;

      // Safe helper function to ensure numbers
      const safeNumber = (value: number | null | undefined): number =>
        value ?? 0;

      // Calculate current totals
      const currentTotals: Totals = (currentData ?? []).reduce<Totals>(
        (acc, item) => ({
          impressions: acc.impressions + safeNumber(item.impressions),
          clicks: acc.clicks + safeNumber(item.clicks),
          revenue: acc.revenue + safeNumber(item.revenue),
        }),
        { impressions: 0, clicks: 0, revenue: 0 }
      );

      // Calculate previous totals
      const previousTotals: Totals = (previousData ?? []).reduce<Totals>(
        (acc, item) => ({
          impressions: acc.impressions + safeNumber(item.impressions),
          clicks: acc.clicks + safeNumber(item.clicks),
          revenue: acc.revenue + safeNumber(item.revenue),
        }),
        { impressions: 0, clicks: 0, revenue: 0 }
      );

      // Calculate growth percentages
      const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const averageCtr =
        currentTotals.impressions > 0
          ? (currentTotals.clicks / currentTotals.impressions) * 100
          : 0;

      const previousCtr =
        previousTotals.impressions > 0
          ? (previousTotals.clicks / previousTotals.impressions) * 100
          : 0;

      return {
        total_impressions: currentTotals.impressions,
        total_clicks: currentTotals.clicks,
        total_revenue: currentTotals.revenue,
        average_ctr: averageCtr,
        impressions_growth: calculateGrowth(
          currentTotals.impressions,
          previousTotals.impressions
        ),
        clicks_growth: calculateGrowth(
          currentTotals.clicks,
          previousTotals.clicks
        ),
        revenue_growth: calculateGrowth(
          currentTotals.revenue,
          previousTotals.revenue
        ),
        ctr_growth: calculateGrowth(averageCtr, previousCtr),
      } as AdAnalyticsSummary;
    },
  });

  const { data: adSpaceData, isLoading: adSpaceLoading } = useQuery({
    queryKey: ["adAnalyticsPerformance", dateRange],
    queryFn: async () => {
      const dateFilter = getDateFilter(dateRange);

      const { data, error } = await supabase
        .from("ad_analytics")
        .select(
          `
          ad_space_id,
          impressions,
          clicks,
          revenue,
          ad_spaces!inner (
            name
          )
        `
        )
        .gte("date", dateFilter);

      if (error) throw error;

      // Group by ad space and calculate totals
      const grouped =
        data?.reduce((acc, item) => {
          const spaceId = item.ad_space_id;
          if (!acc[spaceId]) {
            acc[spaceId] = {
              ad_space_id: spaceId,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ad_space_name: (item.ad_spaces as any)?.name || "Unknown",
              impressions: 0,
              clicks: 0,
              revenue: 0,
              ctr: 0,
              date: dateFilter,
            };
          }

          acc[spaceId].impressions += item.impressions || 0;
          acc[spaceId].clicks += item.clicks || 0;
          acc[spaceId].revenue += item.revenue || 0;

          return acc;
        }, {} as Record<string, AdAnalyticsData>) || {};

      // Calculate CTR for each ad space
      const result = Object.values(grouped).map((space) => ({
        ...space,
        ctr:
          space.impressions > 0 ? (space.clicks / space.impressions) * 100 : 0,
      }));

      return result;
    },
  });

  return {
    summary: summary || {
      total_impressions: 0,
      total_clicks: 0,
      total_revenue: 0,
      average_ctr: 0,
      impressions_growth: 0,
      clicks_growth: 0,
      revenue_growth: 0,
      ctr_growth: 0,
    },
    adSpacePerformance: adSpaceData || [],
    isLoading: summaryLoading || adSpaceLoading,
  };
};

const getDateFilter = (dateRange: string): string => {
  const now = new Date();
  switch (dateRange) {
    case "today":
      return now.toISOString().split("T")[0];
    case "week":
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return weekAgo.toISOString().split("T")[0];
    case "month":
    default:
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return monthAgo.toISOString().split("T")[0];
  }
};

const getPreviousDateFilter = (dateRange: string): string => {
  const now = new Date();
  switch (dateRange) {
    case "today":
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return yesterday.toISOString().split("T")[0];
    case "week":
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      return twoWeeksAgo.toISOString().split("T")[0];
    case "month":
    default:
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      return twoMonthsAgo.toISOString().split("T")[0];
  }
};
