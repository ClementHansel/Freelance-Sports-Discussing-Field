// hooks/useModerationActions.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/components/integrations/supabase/client";

type ContentType = "topic" | "post";

export const useApproveModerationItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<void, Error, { id: string; type: ContentType }>({
    mutationFn: async ({ id, type }) => {
      const { error } = await supabase
        .from(type === "topic" ? "topics" : "posts")
        .update({ moderation_status: "approved" })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["moderationItems", "pending"],
      });
      toast({ title: "Success", description: "Content approved." });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to approve content: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useRejectModerationItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<void, Error, { id: string; type: ContentType }>({
    mutationFn: async ({ id, type }) => {
      const { error } = await supabase
        .from(type === "topic" ? "topics" : "posts")
        .update({ moderation_status: "rejected" })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["moderationItems", "pending"],
      });
      toast({ title: "Success", description: "Content rejected." });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reject content: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useBanUserModeration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<
    void,
    Error,
    { userId: string; itemId: string; itemType: ContentType }
  >({
    mutationFn: async ({ userId, itemId, itemType }) => {
      // First, delete the user's profile
      const { error: userError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
      if (userError) throw new Error(userError.message);

      // Optionally, update the content status to rejected or deleted
      const { error: contentError } = await supabase
        .from(itemType === "topic" ? "topics" : "posts")
        .update({ moderation_status: "rejected" }) // Or 'deleted'
        .eq("id", itemId);
      if (contentError) throw new Error(contentError.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["moderationItems", "pending"],
      });
      // You might also want to invalidate user-related queries
      toast({
        title: "Success",
        description: "User and associated content banned.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ban user: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useBanIPModeration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<
    void,
    Error,
    { ipAddress: string; itemId: string; itemType: ContentType }
  >({
    mutationFn: async ({ ipAddress, itemId, itemType }) => {
      // This is a simplified example. A real IP ban would involve a separate 'banned_ips' table.
      // For now, we'll just update the content status.
      const { error: contentError } = await supabase
        .from(itemType === "topic" ? "topics" : "posts")
        .update({ moderation_status: "rejected" }) // Or 'deleted', or add a 'banned_ip' flag
        .eq("id", itemId)
        .eq("ip_address", ipAddress); // Ensure it matches the IP

      if (contentError) throw new Error(contentError.message);

      // In a real scenario, you'd add the IP to a dedicated ban list:
      // const { error: ipBanError } = await supabase.from('banned_ips').insert({ ip_address: ipAddress });
      // if (ipBanError) throw new Error(ipBanError.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["moderationItems", "pending"],
      });
      toast({
        title: "Success",
        description: "IP address and associated content handled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ban IP: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteModerationItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<void, Error, { id: string; type: ContentType }>({
    mutationFn: async ({ id, type }) => {
      const { error } = await supabase
        .from(type === "topic" ? "topics" : "posts")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["moderationItems", "pending"],
      });
      toast({ title: "Success", description: "Content permanently deleted." });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete content: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
