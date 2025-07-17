// app/(admin)/moderation/_components/AdminModerationContent.tsx
"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Ban, Users, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoryRequestsManager } from "@/components/dashboard/moderator/CategoryRequestsManager";
import { ModerationItemDetailsModal } from "@/components/dashboard/moderator/ModerationItemDetailsModal";
import { ReportDetailsModal } from "@/components/dashboard/moderator/ReportDetailsModal";
import { ModerationItemsTab } from "@/components/dashboard/moderator/ModerationItemsTab";
import { useModerationItems } from "@/hooks/moderation/useModerationItems";
import {
  useApproveModerationItem,
  useBanIPModeration,
  useBanUserModeration,
  useRejectModerationItem,
} from "@/hooks/moderation/useModerationActions";

// Define ModerationItem interface if not already global
interface ModerationItem {
  id: string;
  type: "topic" | "post";
  title: string;
  content: string;
  author: string;
  created_at: string;
  reported_count: number;
  status: "pending" | "approved" | "rejected";
  is_anonymous?: boolean;
  ip_address?: string | null;
  slug?: string;
  category_slug?: string;
  topic_id?: string;
  topic_slug?: string;
}

export const AdminModerationContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // State for modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReport] = useState<Report | null>(null);

  const [isModerationModalOpen, setIsModerationModalOpen] = useState(false);
  const [selectedModerationItem, setSelectedModerationItem] =
    useState<ModerationItem | null>(null);

  // Hooks for data fetching and mutations
  const {
    data: activeModerationItems = [],
    isLoading: isLoadingActiveItems,
    refetch: refetchModerationItems,
  } = useModerationItems("pending");
  const approveMutation = useApproveModerationItem();
  const rejectMutation = useRejectModerationItem();
  const banUserMutation = useBanUserModeration();
  const banIPMutation = useBanIPModeration();

  const handleOpenModerationItemModal = (item: ModerationItem) => {
    setSelectedModerationItem(item);
    setIsModerationModalOpen(true);
  };

  const handleApprove = async (id: string, type: "topic" | "post") => {
    try {
      await approveMutation.mutateAsync({ id, type });
      toast({
        title: "Content Approved",
        description: `The ${type} has been approved.`,
      });
      queryClient.invalidateQueries({
        queryKey: ["moderationItems", "pending"],
      }); // Invalidate pending items
      setIsModerationModalOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to approve ${type}`,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string, type: "topic" | "post") => {
    try {
      await rejectMutation.mutateAsync({ id, type });
      toast({
        title: "Content Rejected",
        description: `The ${type} has been rejected.`,
      });
      queryClient.invalidateQueries({
        queryKey: ["moderationItems", "pending"],
      });
      setIsModerationModalOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to reject ${type}`,
        variant: "destructive",
      });
    }
  };

  const handleBanUser = async (
    userId: string,
    itemId: string,
    itemType: "topic" | "post"
  ) => {
    try {
      await banUserMutation.mutateAsync({ userId, itemId, itemType });
      toast({
        title: "User Banned",
        description: "User associated with content has been banned.",
      });
      queryClient.invalidateQueries({
        queryKey: ["moderationItems", "pending"],
      });
      setIsModerationModalOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to ban user",
        variant: "destructive",
      });
    }
  };

  const handleBanIP = async (
    ipAddress: string,
    itemId: string,
    itemType: "topic" | "post"
  ) => {
    try {
      await banIPMutation.mutateAsync({ ipAddress, itemId, itemType });
      toast({
        title: "IP Banned",
        description: "IP address associated with content has been banned.",
      });
      queryClient.invalidateQueries({
        queryKey: ["moderationItems", "pending"],
      });
      setIsModerationModalOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to ban IP",
        variant: "destructive",
      });
    }
  };

  // Placeholder for ReportsTab if it's not already defined
  const ReportsTab = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">Reports</h2>
        <p className="text-muted-foreground">
          Review and manage user-submitted reports on topics and posts.
        </p>
      </div>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Recent Reports</h3>
        <p className="text-center text-muted-foreground py-8">
          This tab would list individual reports that can be reviewed.
          <br />
          (Assuming `ReportDetailsModal` is used here)
        </p>
        {/* You would integrate a component here that lists reports and calls handleOpenReportModal */}
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Moderation Dashboard</h1>
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            <AlertTriangle className="h-4 w-4 mr-2" /> Pending Content
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" /> User Reports
          </TabsTrigger>
          <TabsTrigger value="category-requests">
            <Users className="h-4 w-4 mr-2" /> Category Requests
          </TabsTrigger>
          <TabsTrigger value="banned">
            <Ban className="h-4 w-4 mr-2" /> Banned Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <ModerationItemsTab
            moderationItems={activeModerationItems}
            isLoading={isLoadingActiveItems}
            onItemClick={handleOpenModerationItemModal}
          />
        </TabsContent>

        <TabsContent value="reports">
          {/* This assumes your original ReportsTab is already a separate file, if not,
              its content would go here or into a new ReportsTab.tsx component */}
          <ReportsTab />
        </TabsContent>

        <TabsContent value="category-requests">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Category Requests</h2>
              <p className="text-muted-foreground">
                Review and manage requests for new forum categories
              </p>
            </div>
            {/* CategoryRequestsManager is already a separate component */}
            <CategoryRequestsManager />
          </div>
        </TabsContent>

        <TabsContent value="banned">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Banned Content</h2>
            <div className="text-center text-muted-foreground py-8">
              No banned content to display.
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals are controlled by this component */}
      <ModerationItemDetailsModal
        isOpen={isModerationModalOpen}
        onClose={() => setIsModerationModalOpen(false)}
        item={selectedModerationItem}
        onApprove={handleApprove}
        onReject={handleReject}
        onBanUser={handleBanUser}
        onBanIP={handleBanIP}
      />

      <ReportDetailsModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={selectedReport}
        onUpdate={() => {
          queryClient.invalidateQueries({ queryKey: ["reports"] }); // Invalidate reports query
          // You might also want to refetch moderation items if a report resolution
          // could affect pending content status.
          refetchModerationItems();
        }}
      />
    </div>
  );
};
