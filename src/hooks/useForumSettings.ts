"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/components/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ParsedSetting {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  type: string;
  category: string;
  description?: string;
  isPublic: boolean;
}

interface ForumSettings {
  [key: string]: ParsedSetting;
}

export const useForumSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    refetch,
  } = useQuery<ForumSettings>({
    queryKey: ["forum-settings"],
    queryFn: async () => {
      console.log("📦 Fetching forum settings...");

      const { data, error } = await supabase
        .from("forum_settings")
        .select("*")
        .order("category", { ascending: true })
        .order("setting_key", { ascending: true });

      if (error) {
        console.error("❌ Error fetching forum settings:", error);
        throw error;
      }

      const settingsMap: ForumSettings = {};

      data?.forEach((setting) => {
        let value = setting.setting_value;

        switch (setting.setting_type) {
          case "boolean":
            value = value === true || value === "true";
            break;
          case "number":
            value =
              typeof value === "number" ? value : parseFloat(value as string);
            break;
          case "string":
          case "code":
          default:
            value = value ?? "";
            break;
        }

        settingsMap[setting.setting_key] = {
          value,
          type: setting.setting_type,
          category: setting.category,
          description: setting.description ?? undefined,
          isPublic: setting.is_public ?? false,
        };
      });

      console.log("✅ Parsed forum settings:", settingsMap);
      return settingsMap;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({
      key,
      value,
      type = "string",
      category = "general",
      description,
    }: {
      key: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: any;
      type?: string;
      category?: string;
      description?: string;
    }) => {
      console.log("✏️ Updating setting:", { key, value, type });

      let jsonValue = value;
      if (type === "number" && typeof value !== "string") {
        jsonValue = String(value);
      }

      const { error } = await supabase.rpc("set_forum_setting", {
        key_name: key,
        value: jsonValue,
        setting_type: type,
        category,
        description,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-settings"] });
      toast({
        title: "Settings updated",
        description: "Forum settings saved successfully.",
      });
    },
    onError: (error) => {
      console.error("❌ Failed to update setting:", error);
      toast({
        title: "Error",
        description: "Failed to update forum setting.",
        variant: "destructive",
      });
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getSetting = (key: string, defaultValue: any = "") => {
    const setting = settings?.[key];
    return setting?.value ?? defaultValue;
  };

  const getSettingsByCategory = (category: string) => {
    if (!settings) return {};
    return Object.fromEntries(
      Object.entries(settings).filter(
        ([, setting]) => setting.category === category
      )
    );
  };

  const forceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["forum-settings"] });
    refetch();
  };

  useEffect(() => {
    const channel = supabase
      .channel("forum-settings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "forum_settings",
        },
        (payload) => {
          console.log("📡 Realtime update for forum_settings:", payload);
          queryClient.invalidateQueries({ queryKey: ["forum-settings"] });
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, refetch]);

  return {
    settings,
    isLoading,
    updateSetting: updateSettingMutation.mutate,
    isUpdating: updateSettingMutation.isPending,
    getSetting,
    getSettingsByCategory,
    forceRefresh,
  };
};
