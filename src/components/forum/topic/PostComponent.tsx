import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WysiwygEditor } from "@/components/ui/wysiwyg-editor";
import { HTMLRenderer } from "@/components/ui/html-renderer";
import { Flag, MessageCircle, Share, Edit } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

import { InlineReplyForm } from "./InlineReplyForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEditPost } from "@/hooks/useEditPost";
import { supabase } from "@/components/integrations/supabase/client";
import { AdminControls } from "../forum/AdminControls";

interface PostComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: any;
  topicId: string;
  depth?: number;
  onReport: (
    contentType: "post" | "topic",
    postId?: string,
    topicId?: string
  ) => void;
}

export const PostComponent: React.FC<PostComponentProps> = React.memo(
  ({ post, topicId, depth = 0, onReport }) => {
    const { user } = useAuth();
    const { mutate: editPost, isPending: isEditingPost } = useEditPost();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [moderationStatus, setModerationStatus] = useState(
      post.moderation_status || "approved"
    );
    const [isVisible, setIsVisible] = useState(
      (post.moderation_status || "approved") === "approved"
    );
    const { toast } = useToast();

    // Real-time subscription for moderation status changes
    useEffect(() => {
      const channel = supabase
        .channel(`post-moderation-${post.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "posts",
            filter: `id=eq.${post.id}`,
          },
          (payload) => {
            if (payload.new) {
              const newStatus = payload.new.moderation_status;
              setModerationStatus(newStatus);
              setIsVisible(newStatus === "approved");

              if (newStatus === "pending") {
                toast({
                  title: "Content flagged",
                  description:
                    "This post has been flagged and is now under review.",
                  variant: "default",
                });
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [post.id, toast]);

    // Don't render the post if it's not approved
    if (moderationStatus !== "approved") {
      return (
        <div className="relative border-b border-border/50 pb-2 mb-2 w-full">
          <div className="bg-muted/50 p-3 md:p-4 rounded-md w-full text-center">
            <div className="text-muted-foreground text-sm">
              {moderationStatus === "pending"
                ? "This post is under review and temporarily unavailable."
                : "This post has been removed by moderators."}
            </div>
          </div>
        </div>
      );
    }

    // Removed hasReplies since we're not nesting replies anymore

    const handleReplySuccess = () => {
      setShowReplyForm(false);
    };

    const handleEditSave = () => {
      if (editContent.trim() !== post.content) {
        editPost({ postId: post.id, content: editContent.trim() });
      }
      setIsEditing(false);
    };

    const handleEditCancel = () => {
      setEditContent(post.content);
      setIsEditing(false);
    };

    const canEdit =
      user &&
      (user.id === post.author_id ||
        user.role === "admin" ||
        user.role === "moderator");

    // Debug logging
    console.log("PostComponent Debug:", {
      postId: post.id,
      postContent: post.content,
      postContentLength: post.content?.length,
      moderationStatus: moderationStatus,
      postModerationStatus: post.moderation_status,
      isVisible: isVisible,
      depth: depth,
      parentPostId: post.parent_post_id,
      hasParentPost: !!post.parent_post,
      user: user,
      postAuthorId: post.author_id,
      postIsAnonymous: post.is_anonymous,
      canEdit: canEdit,
      userIdMatch: user?.id === post.author_id,
    });

    const handleShare = async () => {
      // Use current URL which should already be in slug format
      const shareUrl = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
      const shareData = {
        title: "Forum Post",
        text: `Check out this post: ${post.content.slice(0, 100)}${
          post.content.length > 100 ? "..." : ""
        }`,
        url: shareUrl,
      };

      // Check if Web Share API is available and supported
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        try {
          await navigator.share(shareData);
          toast({
            title: "Shared successfully!",
            description: "Post shared using your device's share menu",
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          // User cancelled share or error occurred
          if (error.name !== "AbortError") {
            console.log("Web Share failed, falling back to clipboard:", error);
            handleClipboardShare(shareUrl);
          }
        }
      } else {
        console.log("Web Share API not available, using clipboard fallback");
        handleClipboardShare(shareUrl);
      }
    };

    const handleClipboardShare = async (url: string) => {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Post link has been copied to clipboard",
        });
      } catch {
        toast({
          title: "Share failed",
          description: "Could not copy link to clipboard",
          variant: "destructive",
        });
      }
    };

    // Color system for replies using text colors instead of indentation
    const replyTextColors = [
      "text-primary",
      "text-accent",
      "text-secondary",
      "text-muted-foreground",
      "text-orange-600",
    ];

    const colorIndex = depth % replyTextColors.length;
    const replyTextColor =
      depth > 0 ? replyTextColors[colorIndex] : "text-foreground";

    return (
      <div
        id={`post-${post.id}`}
        className="relative border-b border-border/50 pb-2 mb-2 w-full"
      >
        <div className="bg-card p-3 md:p-4 rounded-md w-full">
          {/* User info header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-medium text-foreground text-sm">
                {post.profiles?.username || "Anonymous"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at))} ago
              </span>
            </div>
          </div>

          {/* Post content - Full width */}
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-3">
                <WysiwygEditor
                  value={editContent}
                  onChange={setEditContent}
                  placeholder="Edit your post..."
                  height={150}
                  allowImages={!!user}
                  hideToolbar={!user}
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleEditSave}
                    disabled={isEditingPost || !editContent.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEditCancel}
                    disabled={isEditingPost}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Show original comment being replied to */}
                {post.parent_post_id && post.parent_post && (
                  <div className="bg-muted/30 border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                      <MessageCircle className="h-3 w-3" />
                      <span>Replying to</span>
                      <span className="font-medium text-foreground">
                        {post.parent_post.profiles?.username || "Anonymous"}
                      </span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(
                          new Date(post.parent_post.created_at)
                        )}{" "}
                        ago
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground bg-background/50 rounded p-2 border-l-2 border-muted">
                      {post.parent_post.moderation_status === "approved" ? (
                        <HTMLRenderer content={post.parent_post.content} />
                      ) : (
                        <div className="italic text-muted-foreground">
                          [This content is under review and temporarily
                          unavailable]
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* MAIN REPLY CONTENT - This is the user's actual response */}
                <div
                  className={`${replyTextColor} text-base font-normal bg-background p-3 rounded border-l-4 border-primary`}
                >
                  <HTMLRenderer content={post.content} />
                </div>

                {post.updated_at !== post.created_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    (edited {formatDistanceToNow(new Date(post.updated_at))}{" "}
                    ago)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Compact action bar */}
          <TooltipProvider>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {/* Reply button - icon only */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={() => {
                      console.log(
                        "PostComponent reply button clicked, current state:",
                        showReplyForm
                      );
                      setShowReplyForm(!showReplyForm);
                    }}
                  >
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reply</p>
                </TooltipContent>
              </Tooltip>

              {/* Edit button - icon only (show only for post author or moderators) */}
              {canEdit && !isEditing && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Share button - icon only */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={handleShare}
                  >
                    <Share className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share</p>
                </TooltipContent>
              </Tooltip>

              {/* Admin Controls - only for admins */}
              {user?.role === "admin" && (
                <AdminControls content={post} contentType="post" />
              )}

              {/* Report button - icon only with red color */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onReport("post", post.id)}
                  >
                    <Flag className="h-3 w-3 fill-current" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Report</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Inline reply form */}
          {showReplyForm && (
            <InlineReplyForm
              topicId={topicId}
              parentPostId={post.id}
              parentPost={post}
              onCancel={() => setShowReplyForm(false)}
              onSuccess={handleReplySuccess}
            />
          )}
        </div>
      </div>
    );
  }
);
PostComponent.displayName = "PostComponent";
