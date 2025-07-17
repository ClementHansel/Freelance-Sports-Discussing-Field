// app/(admin)/moderation/_components/ModerationItemsTab.tsx
"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Re-define ModerationItem interface if not globally available
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

interface ModerationItemsTabProps {
  moderationItems: ModerationItem[];
  isLoading: boolean;
  onItemClick: (item: ModerationItem) => void;
}

export const ModerationItemsTab: React.FC<ModerationItemsTabProps> = ({
  moderationItems,
  isLoading,
  onItemClick,
}) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground py-8">
          Loading active moderation items...
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Active Moderation Items</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {moderationItems.length > 0 ? (
              moderationItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge
                      variant={item.type === "topic" ? "default" : "secondary"}
                    >
                      {item.type === "topic" ? "Topic" : "Post"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.type === "topic" ? (
                      <Link
                        href={`/forum/${item.category_slug}/${item.slug}`}
                        className="hover:underline text-blue-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <Link
                        href={`/forum/${item.category_slug}/${item.topic_slug}#post-${item.id}`}
                        className="hover:underline text-blue-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.title || item.content?.substring(0, 50) + "..."}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>{item.author}</TableCell>
                  <TableCell>{item.reported_count}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onItemClick(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No content to moderate
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
