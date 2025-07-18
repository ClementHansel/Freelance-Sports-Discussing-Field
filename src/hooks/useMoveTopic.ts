import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/components/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MoveTopicParams {
  topicId: string;
  newCategoryId: string;
  currentCategoryName: string;
  newCategoryName: string;
}

export const useMoveTopic = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      topicId,
      newCategoryId,
      currentCategoryName,
      newCategoryName,
    }: MoveTopicParams) => {
      // Update the topic's category
      const { data, error } = await supabase
        .from("topics")
        .update({
          category_id: newCategoryId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", topicId)
        .select("*")
        .single();

      if (error) throw error;

      // Log the admin action
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user?.id) throw new Error("User ID is missing.");

        await supabase.rpc("log_admin_action", {
          p_admin_user_id: user.id,
          p_action_type: "topic_moved",
          p_target_type: "topic",
          p_target_id: topicId,
          p_target_details: {
            from_category: currentCategoryName,
            to_category: newCategoryName,
            category_id: newCategoryId,
          },
        });
      } catch (logError) {
        console.warn("Failed to log admin action:", logError);
      }

      return data;
    },
    onSuccess: (_, { currentCategoryName, newCategoryName }) => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["hot-topics"] });

      toast({
        title: "Topic Moved",
        description: `Topic moved from ${currentCategoryName} to ${newCategoryName}`,
      });
    },
    onError: (error) => {
      console.error("Error moving topic:", error);
      toast({
        title: "Error",
        description: "Failed to move topic",
        variant: "destructive",
      });
    },
  });
};
