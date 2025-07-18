import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/components/integrations/supabase/client";

export interface EnrichedTopic {
  id: string;
  title: string;
  content: string | null;
  slug: string;
  category_id: string;
  created_at: string | null;
  updated_at: string | null;
  author_id: string | null;
  reply_count: number | null;
  view_count: number | null;
  last_reply_at: string | null;
  last_post_id?: string | null;

  // enriched fields
  author_username: string | null;
  author_avatar_url: string | null;
  category_name: string | null;
  category_color: string | null;
  category_slug: string | null;
  parent_category_id: string;

  profiles: {
    username: string;
    avatar_url: string;
  } | null;

  categories: {
    name: string;
    color: string;
    slug: string;
    parent_category_id: string;
  } | null;
}

export interface PaginatedTopicsResult {
  data: EnrichedTopic[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const useTopics = (categoryId?: string, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: ["topics", categoryId, page, limit],
    queryFn: async () => {
      console.log(
        "Fetching topics for category:",
        categoryId,
        "with optimized function"
      );

      // Use optimized enriched function - eliminates N+1 queries
      const [{ data: topics, error }, { data: totalCount, error: countError }] =
        await Promise.all([
          supabase.rpc("get_enriched_topics", {
            p_category_id: categoryId ?? undefined,
            p_limit: limit,
            p_offset: offset,
          }),
          supabase.rpc("get_enriched_topics_count", {
            p_category_id: categoryId ?? undefined,
          }),
        ]);

      if (error) {
        console.error("Error fetching enriched topics:", error);
        throw error;
      }

      if (countError) {
        console.error("Error fetching topics count:", countError);
        throw countError;
      }

      if (!topics || topics.length === 0) {
        return {
          data: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: page,
        } as PaginatedTopicsResult;
      }

      // Transform enriched data to match expected interface
      const enrichedTopics = topics.map((topic) => ({
        ...topic,
        profiles: topic.author_username
          ? {
              username: topic.author_username,
              avatar_url: topic.author_avatar_url,
            }
          : null,
        categories: topic.category_name
          ? {
              name: topic.category_name,
              color: topic.category_color,
              slug: topic.category_slug,
              parent_category_id: topic.parent_category_id,
            }
          : null,
      }));

      console.log(
        "Optimized topics fetched:",
        enrichedTopics.length,
        "topics in single query"
      );

      const totalPages = Math.ceil((totalCount as number) / limit);

      return {
        data: enrichedTopics,
        totalCount: totalCount as number,
        totalPages,
        currentPage: page,
      } as PaginatedTopicsResult;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes - topics are dynamic but not constantly changing
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });
};
