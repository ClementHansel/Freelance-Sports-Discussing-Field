"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

import { sessionManager } from "@/utils/sessionManager";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/components/integrations/supabase/client";

type PresenceUserStatus = {
  user_id: string;
  online_at: string;
  is_authenticated: boolean;
};

type PresenceState = Record<string, PresenceUserStatus[]>;

interface OnlineUsersContextType {
  onlineCount: number;
}

const OnlineUsersContext = createContext<OnlineUsersContextType | undefined>(
  undefined
);

export const OnlineUsersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [onlineCount, setOnlineCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel: any = null;
    let isSubscribed = false;

    const initializePresence = async () => {
      try {
        console.log("🔄 Initializing online presence tracking...");

        // Ensure session is initialized for anonymous users
        if (!user) {
          await sessionManager.initializeSession();
          console.log("📝 Session initialized for anonymous user");
        }

        // Get persistent user ID
        const userId = user ? user.id : sessionManager.getTempUserId();
        console.log(
          "👤 User ID for presence:",
          userId,
          user ? "(authenticated)" : "(anonymous)"
        );

        if (!userId) {
          console.error("❌ No user ID available for presence tracking");
          return;
        }

        channel = supabase.channel("online_users", {
          config: {
            presence: {
              key: "user_presence",
            },
          },
        });

        channel
          .on("presence", { event: "sync" }, () => {
            if (!isSubscribed) return;
            const presenceState = channel.presenceState();
            console.log("🔄 Presence sync event:", presenceState);

            const uniqueUsers = new Set();

            // Count unique users by their persistent ID
            Object.values(presenceState as PresenceState).forEach(
              (presences: PresenceUserStatus[]) => {
                presences.forEach((presence: PresenceUserStatus) => {
                  uniqueUsers.add(presence.user_id);
                });
              }
            );

            const count = uniqueUsers.size;
            console.log(
              "👥 Online users count:",
              count,
              "Unique IDs:",
              Array.from(uniqueUsers)
            );
            setOnlineCount(count);

            // Update peak users if current count is higher
            if (count > 0) {
              supabase
                .rpc("update_peak_users", { current_count: count })
                .then(({ error }) => {
                  if (error) {
                    console.error("❌ Error updating peak users:", error);
                  } else {
                    console.log("📈 Peak users updated with count:", count);
                  }
                });
            }
          })
          .on(
            "presence",
            { event: "join" },
            (payload: { newPresences: PresenceUserStatus[] }) => {
              const { newPresences } = payload;
              console.log("➕ User joined:", newPresences);

              const presenceState = channel.presenceState();
              const uniqueUsers = new Set();

              Object.values(presenceState as PresenceState).forEach(
                (presences: PresenceUserStatus[]) => {
                  presences.forEach((presence: PresenceUserStatus) => {
                    uniqueUsers.add(presence.user_id);
                  });
                }
              );

              const count = uniqueUsers.size;
              console.log("👥 Online users count after join:", count);
              setOnlineCount(count);

              // Update peak users if current count is higher
              if (count > 0) {
                supabase.rpc("update_peak_users", { current_count: count });
              }
            }
          )
          .on(
            "presence",
            { event: "leave" },
            (payload: { leftPresences: PresenceUserStatus[] }) => {
              const { leftPresences } = payload;
              console.log("➖ User left:", leftPresences);

              const presenceState = channel.presenceState();
              const uniqueUsers = new Set();

              Object.values(presenceState as PresenceState).forEach(
                (presences: PresenceUserStatus[]) => {
                  presences.forEach((presence: PresenceUserStatus) => {
                    uniqueUsers.add(presence.user_id);
                  });
                }
              );

              const count = uniqueUsers.size;
              console.log("👥 Online users count after leave:", count);
              setOnlineCount(count);
            }
          )
          .subscribe(async (status: string) => {
            if (status === "SUBSCRIBED") {
              const userStatus = {
                user_id: userId,
                online_at: new Date().toISOString(),
                is_authenticated: !!user,
              };

              try {
                const trackResult = await channel.track(userStatus);
                console.log("✅ Presence tracked:", trackResult);
              } catch (error) {
                console.error("❌ Error tracking presence:", error);
              }
            }
          });
      } catch (error) {
        console.error("❌ Error initializing presence:", error);
      }
    };

    initializePresence();

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up presence tracking");
      isSubscribed = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user]); // Re-run when user auth state changes

  return (
    <OnlineUsersContext.Provider value={{ onlineCount }}>
      {children}
    </OnlineUsersContext.Provider>
  );
};

export const useOnlineUsers = () => {
  const context = useContext(OnlineUsersContext);
  if (context === undefined) {
    throw new Error(
      "useOnlineUsers must be used within an OnlineUsersProvider"
    );
  }
  return context.onlineCount;
};
