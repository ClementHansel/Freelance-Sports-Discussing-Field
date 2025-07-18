import { useQuery } from "@tanstack/react-query";
import { Category } from "./useCategories";
import { supabase } from "@/components/integrations/supabase/client";

interface CategoryWithActivity extends Category {
  last_activity_at: string | null;
}

export const useCategoriesByActivity = (
  parentId?: string | null,
  level?: number
) => {
  // convert null to undefined for the queryKey
  const normalizedParentId = parentId ?? undefined;

  return useQuery({
    queryKey: ["categories-by-activity", normalizedParentId, level],
    queryFn: async () => {
      console.log(
        "Fetching categories by activity with parentId:",
        parentId,
        "level:",
        level
      );

      const { data, error } = await supabase.rpc("get_categories_by_activity", {
        p_parent_category_id: parentId ?? undefined,
        p_category_level: level,
      });

      if (error) {
        console.error("Error fetching categories by activity:", error);
        throw error;
      }

      console.log("Categories by activity fetched:", data);
      return data as CategoryWithActivity[];
    },
  });
};
