// sports-disscussing-field\src\hooks\useAdminActivity.ts
import { supabase } from "@/components/integrations/supabase/client";
import { Database } from "@/components/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";

// Define the row types from your Supabase database for clarity
type TopicRow = Database["public"]["Tables"]["topics"]["Row"];
type PostRow = Database["public"]["Tables"]["posts"]["Row"];

// Define the exact shape of data returned by the 'topics' select query
type FetchedTopic = Pick<
  TopicRow,
  | "id"
  | "title"
  | "slug"
  | "created_at"
  | "author_id"
  | "canonical_url"
  | "category_id"
  | "content"
  | "ip_address"
  | "is_anonymous"
  | "is_locked"
  | "is_pinned"
  | "last_reply_at"
  | "moderation_status"
  | "updated_at"
  | "view_count"
> & {
  categories: { slug: string } | null; // Adjusted to reflect single object or null
};

// Define the exact shape of data returned by the 'posts' select query
type FetchedPost = Pick<
  PostRow,
  | "id"
  | "content"
  | "created_at"
  | "author_id"
  | "topic_id"
  | "ip_address"
  | "is_anonymous"
  | "moderation_status"
  | "parent_post_id"
  | "updated_at"
> & {
  topics: {
    id: string;
    title: string;
    slug: string;
    categories: { slug: string } | null; // Adjusted to reflect single object or null
  } | null;
};

// Define the structure for an AdminActivity item
interface AdminActivity {
  id: string;
  user: string;
  action: string;
  content: string;
  time: string | null; // created_at can be null
  type: "topic" | "post";
  ip_address: string | undefined; // Can be string or undefined
  topic_info?: {
    // Optional for posts
    title: string;
    slug: string;
    category_slug: string;
  };
}

export const useAdminActivity = () => {
  return useQuery<AdminActivity[], Error>({
    // Specify return type for useQuery
    queryKey: ["admin-activity"],
    queryFn: async () => {
      // Get recent topics with category information
      const { data: recentTopics, error: topicsError } = await supabase
        .from("topics")
        .select(
          `
          id,
          title,
          slug,
          created_at,
          author_id,
          canonical_url,
          category_id,
          content,
          ip_address,
          is_anonymous,
          is_locked,
          is_pinned,
          last_reply_at,
          moderation_status,
          updated_at,
          view_count,
          categories (
            slug
          )
        `
        );
      // Explicitly cast data to FetchedTopic[] to mark the type as used
      const typedRecentTopics: FetchedTopic[] | null = recentTopics;

      if (topicsError) {
        console.error("Error fetching recent topics:", topicsError.message);
        throw new Error("Failed to load recent topics.");
      }

      // Get recent posts with topic and category information
      const { data: recentPosts, error: postsError } = await supabase
        .from("posts")
        .select(
          `
          id,
          content,
          created_at,
          author_id,
          topic_id,
          ip_address,
          is_anonymous,
          moderation_status,
          parent_post_id,
          updated_at,
          topics (
            id,
            title,
            slug,
            categories (
              slug
            )
          )
        `
        );
      // Explicitly cast data to FetchedPost[] to mark the type as used
      const typedRecentPosts: FetchedPost[] | null = recentPosts;

      if (postsError) {
        console.error("Error fetching recent posts:", postsError.message);
        throw new Error("Failed to load recent posts.");
      }

      // Get unique author IDs, ensuring they are strings
      const authorIds: string[] = Array.from(
        new Set(
          [
            ...(typedRecentTopics || []).map((topic) => topic.author_id),
            ...(typedRecentPosts || []).map((post) => post.author_id),
          ].filter((id): id is string => id !== null)
        )
      );

      // Fetch user data from both profiles and temporary_users
      const [profilesData, temporaryUsersData] = await Promise.all([
        authorIds.length > 0
          ? supabase
              .from("profiles")
              .select("id, username")
              .in("id", authorIds)
              .then(({ data }) => data || [])
          : Promise.resolve([]),

        authorIds.length > 0
          ? supabase
              .from("temporary_users")
              .select("id, display_name")
              .in("id", authorIds)
              .then(({ data }) => data || [])
          : Promise.resolve([]),
      ]);

      // Create a map for quick user lookup
      const userMap = new Map<string, string>();
      profilesData.forEach((profile) => {
        userMap.set(profile.id, profile.username);
      });
      temporaryUsersData.forEach((tempUser) => {
        userMap.set(tempUser.id, tempUser.display_name);
      });

      // Combine and format activities
      const activities: AdminActivity[] = [];

      // Add topics
      typedRecentTopics?.forEach((topic) => {
        const username = topic.author_id
          ? userMap.get(topic.author_id) || "Anonymous User"
          : "Anonymous User";
        activities.push({
          id: topic.id,
          user: username,
          action: "Created topic",
          content: topic.title,
          time: topic.created_at,
          type: "topic",
          ip_address: topic.ip_address as string | undefined, // Cast to string | undefined
          topic_info: {
            title: topic.title,
            slug: topic.slug,
            category_slug: topic.categories?.slug || "", // Access slug directly
          },
        });
      });

      // Add posts
      typedRecentPosts?.forEach((post) => {
        const username = post.author_id
          ? userMap.get(post.author_id) || "Anonymous User"
          : "Anonymous User";
        activities.push({
          id: post.id,
          user: username,
          action: "Replied to",
          content: post.content, // Changed to post.content for post activity
          time: post.created_at,
          type: "post",
          ip_address: post.ip_address ? String(post.ip_address) : undefined,
          topic_info: post.topics
            ? {
                title: post.topics.title,
                slug: post.topics.slug,
                category_slug: post.topics.categories?.slug || "", // Access slug directly
              }
            : undefined,
        });
      });

      // Sort by time and take the 10 most recent
      return activities
        .sort(
          (a, b) =>
            new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime()
        ) // Handle null for time
        .slice(0, 10);
    },
  });
};
