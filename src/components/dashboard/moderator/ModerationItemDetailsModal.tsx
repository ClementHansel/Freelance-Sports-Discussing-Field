// sports-disscussing-field\src\components\dashboard\moderator\ModerationItemDetailsModal.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  UserX,
  WifiOff,
  Ban,
  ExternalLink,
  Calendar,
  User,
  MapPin,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ModerationItem } from "@/hooks/moderation/useModerationItems";

interface ModerationItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ModerationItem | null;
  onApprove: (id: string, type: "topic" | "post") => void;
  onReject: (id: string, type: "topic" | "post") => void;
  onBanUser: (author: string, itemId: string, type: "topic" | "post") => void;
  onBanIP: (
    ipAddress: string,
    itemId: string,
    type: "topic" | "post"
  ) => Promise<void>;
}

export const ModerationItemDetailsModal: React.FC<
  ModerationItemDetailsModalProps
> = ({ isOpen, onClose, item, onApprove, onReject, onBanUser, onBanIP }) => {
  if (!item) return null;

  const getContentUrl = (item: ModerationItem) => {
    if (item.type === "topic") {
      if (item.category_slug && item.slug) {
        return `/forum/${item.category_slug}/${item.slug}`; // Added /forum/ prefix
      }
      return `/forum/topic/${item.id}`; // Added /forum/topic/ prefix
    } else {
      if (item.category_slug && item.topic_slug) {
        return `/forum/${item.category_slug}/${item.topic_slug}#post-${item.id}`; // Added /forum/ prefix and post ID anchor
      }
      return `/forum/topic/${item.topic_id}#post-${item.id}`; // Added /forum/topic/ prefix and post ID anchor
    }
  };

  const handleAction = async (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant={item.type === "topic" ? "default" : "secondary"}>
              {item.type}
            </Badge>
            {item.is_anonymous && (
              <Badge variant="outline" className="text-xs">
                Anonymous
              </Badge>
            )}
            Moderation Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content Header */}
          <Card className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {item.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {/* Corrected: Provide a fallback for item.created_at if it's null */}
                    {formatDistanceToNow(new Date(item.created_at || 0), {
                      addSuffix: true,
                    })}{" "}
                    ago
                  </div>
                  {item.ip_address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <code className="bg-muted px-1 py-0.5 rounded text-xs">
                        {item.ip_address}
                      </code>
                    </div>
                  )}
                </div>
              </div>
              <Link
                href={getContentUrl(item)}
                className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                View Live
              </Link>
            </div>
          </Card>

          <Separator />

          {/* Full Content */}
          <Card className="p-6">
            <h4 className="font-medium mb-3">Content</h4>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap break-words">
                {item.content}
              </div>
            </div>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Moderation Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  handleAction(() => onApprove(item.id, item.type))
                }
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4" />
                Approve Content
              </Button>

              <Button
                onClick={() => handleAction(() => onReject(item.id, item.type))}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Ban className="h-4 w-4" />
                Reject Content
              </Button>

              <Button
                onClick={() =>
                  handleAction(() => onBanUser(item.author, item.id, item.type))
                }
                variant="outline"
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300"
                disabled={item.author === "Anonymous User"}
              >
                <UserX className="h-4 w-4" />
                Ban User
              </Button>

              {item.ip_address && (
                <Button
                  onClick={async () => {
                    await onBanIP(item.ip_address!, item.id, item.type); // assert non-null
                    onClose();
                  }}
                  variant="outline"
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 border-purple-200 hover:border-purple-300"
                >
                  <WifiOff className="h-4 w-4" />
                  Ban IP Address
                </Button>
              )}
            </div>

            <div className="mt-3 text-sm text-muted-foreground">
              <p>
                <strong>Note:</strong> All actions will immediately affect the
                content visibility and user access.
              </p>
              {item.author === "Anonymous User" && (
                <p className="text-amber-600 mt-1">
                  <strong>Anonymous User:</strong> User banning is not available
                  for anonymous posts. Consider IP banning instead.
                </p>
              )}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
