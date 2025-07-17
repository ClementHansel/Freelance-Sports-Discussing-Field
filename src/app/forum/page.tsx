"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Clock,
  Star,
  MessageSquare,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import { useTopics } from "@/hooks/useTopics";
import { useMostCommentedTopics } from "@/hooks/useMostCommentedTopics";
import { useMostViewedTopics } from "@/hooks/useMostViewedTopics";
import { useCategories } from "@/hooks/useCategories";
import { useForumSettings } from "@/hooks/useForumSettings";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PostCard } from "@/components/forum/forum/PostCard";
import { ReportModal } from "@/components/forum/forum/ReportModal";

export default function ForumHome() {
  const { getSetting } = useForumSettings();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    topicId?: string;
  }>({
    isOpen: false,
  });

  // Pagination state for each tab
  const [hotPage, setHotPage] = useState(1);
  const [newPage, setNewPage] = useState(1);
  const [topPage, setTopPage] = useState(1);

  const sortBy = searchParams.get("sort") || "new";

  // Paginated data hooks
  const { data: hotTopicsData, isLoading: hotTopicsLoading } =
    useMostCommentedTopics(hotPage, 10);
  const { data: newTopicsData, isLoading: newTopicsLoading } = useTopics(
    undefined,
    newPage,
    10
  );
  const { data: topTopicsData, isLoading: topTopicsLoading } =
    useMostViewedTopics(topPage, 10);

  const { data: level1Forums } = useCategories(null, 1); // Only Level 1 forums
  const { data: level2Forums } = useCategories(undefined, 2); // Province/State forums

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "new") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`?${params.toString()}`);
    setHotPage(1);
    setNewPage(1);
    setTopPage(1);
  };

  const handleReport = (topicId: string) => {
    setReportModal({
      isOpen: true,
      topicId,
    });
  };

  return (
    <div className="space-y-6 relative w-full overflow-x-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {getSetting("forum_name", "Minor Hockey Talks")}
        </h1>
        <p className="text-muted-foreground">
          {getSetting(
            "forum_description",
            "A community forum for minor hockey discussions"
          )}
        </p>

        {/* Social Media Links */}
        {(() => {
          // Clean URLs by removing JSON encoding quotes
          const cleanUrl = (url: string) => {
            if (!url || typeof url !== "string") return "";
            return url.replace(/^"(.*)"$/, "$1").trim();
          };

          const facebookUrl = cleanUrl(getSetting("social_facebook", ""));
          const twitterUrl = cleanUrl(getSetting("social_twitter", ""));
          const instagramUrl = cleanUrl(getSetting("social_instagram", ""));
          const youtubeUrl = cleanUrl(getSetting("social_youtube", ""));

          // Validate URLs start with http/https
          const isValidUrl = (url: string) => {
            return (
              url && (url.startsWith("http://") || url.startsWith("https://"))
            );
          };

          const validFacebook = isValidUrl(facebookUrl);
          const validTwitter = isValidUrl(twitterUrl);
          const validInstagram = isValidUrl(instagramUrl);
          const validYoutube = isValidUrl(youtubeUrl);

          // Only show if at least one valid social link exists
          const hasValidSocialLinks =
            validFacebook || validTwitter || validInstagram || validYoutube;

          if (!hasValidSocialLinks) return null;

          return (
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm text-muted-foreground">Follow us:</span>
              {validFacebook && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {validTwitter && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {validInstagram && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {validYoutube && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="youtube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          );
        })()}
      </div>

      {/* Sort Tabs */}
      <Tabs value={sortBy} onValueChange={handleSortChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>New</span>
          </TabsTrigger>
          <TabsTrigger value="hot" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Hot</span>
          </TabsTrigger>
          <TabsTrigger value="top" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Top</span>
          </TabsTrigger>
        </TabsList>

        {/* Hot Posts */}
        <TabsContent value="hot" className="space-y-4">
          {hotTopicsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-muted rounded animate-pulse"
                ></div>
              ))}
            </div>
          ) : hotTopicsData && hotTopicsData.data.length > 0 ? (
            <>
              <div className="space-y-4">
                {hotTopicsData.data.map((topic) => (
                  <PostCard
                    key={topic.id}
                    topic={topic}
                    onReport={handleReport}
                  />
                ))}
              </div>
              <PaginationControls
                currentPage={hotPage}
                totalPages={hotTopicsData.totalPages}
                totalItems={hotTopicsData.totalCount}
                itemsPerPage={10}
                onPageChange={setHotPage}
                loading={hotTopicsLoading}
              />
            </>
          ) : (
            <Card className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                Be the first to start a discussion!
              </p>
            </Card>
          )}
        </TabsContent>

        {/* New Posts */}
        <TabsContent value="new" className="space-y-4">
          {newTopicsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-muted rounded animate-pulse"
                ></div>
              ))}
            </div>
          ) : newTopicsData && newTopicsData.data.length > 0 ? (
            <>
              <div className="space-y-4">
                {newTopicsData.data.map((topic) => (
                  <PostCard
                    key={topic.id}
                    topic={{
                      ...topic,
                      username: topic.profiles?.username || null,
                      avatar_url: topic.profiles?.avatar_url || null,
                      category_name: topic.categories?.name || "General",
                      category_color: topic.categories?.color || "#3b82f6",
                      category_slug: topic.categories?.slug || "",
                      slug: topic.slug,
                      hot_score: 0,
                      last_post_id: topic.last_post_id ?? null,
                      parent_category_id:
                        topic.categories?.parent_category_id || null,
                      parent_category_slug: null, // Not available in useTopics data
                    }}
                    onReport={handleReport}
                  />
                ))}
              </div>
              <PaginationControls
                currentPage={newPage}
                totalPages={newTopicsData.totalPages}
                totalItems={newTopicsData.totalCount}
                itemsPerPage={10}
                onPageChange={setNewPage}
                loading={newTopicsLoading}
              />
            </>
          ) : (
            <Card className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                Be the first to start a discussion!
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Top Posts */}
        <TabsContent value="top" className="space-y-4">
          {topTopicsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-muted rounded animate-pulse"
                ></div>
              ))}
            </div>
          ) : topTopicsData && topTopicsData.data.length > 0 ? (
            <>
              <div className="space-y-4">
                {topTopicsData.data.map((topic) => (
                  <PostCard
                    key={topic.id}
                    topic={topic}
                    onReport={handleReport}
                  />
                ))}
              </div>
              <PaginationControls
                currentPage={topPage}
                totalPages={topTopicsData.totalPages}
                totalItems={topTopicsData.totalCount}
                itemsPerPage={10}
                onPageChange={setTopPage}
                loading={topTopicsLoading}
              />
            </>
          ) : (
            <Card className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                Be the first to start a discussion!
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Forums Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Browse Main Forums
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {level1Forums?.map((forum) => (
            <Link
              key={forum.id}
              href={`/category/${forum.slug}`}
              className="block"
            >
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-3 mb-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: forum.color }}
                  />
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {forum.name}
                  </h3>
                </div>
                {forum.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {forum.description}
                  </p>
                )}
                <div className="flex items-center text-xs text-muted-foreground space-x-4">
                  {forum.region && <span>Region: {forum.region}</span>}
                  {forum.birth_year && (
                    <span>Birth Year: {forum.birth_year}</span>
                  )}
                  {forum.play_level && <span>Level: {forum.play_level}</span>}
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {(!level1Forums || level1Forums.length === 0) && (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No forums available</h3>
            <p className="text-muted-foreground">
              Forums will appear here once they are created.
            </p>
          </Card>
        )}
      </div>

      {/* Province/State Forums Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Browse Province / State Forums
          </h2>
        </div>

        {level2Forums && level2Forums.length > 0 ? (
          <div className="space-y-6">
            {(() => {
              // Filter out tournament forums and group by country using parent_category_id
              const canadianForums = level2Forums
                .filter(
                  (forum) =>
                    forum.parent_category_id ===
                    "11111111-1111-1111-1111-111111111111"
                )
                .sort((a, b) => (a.region || "").localeCompare(b.region || ""));

              const usaForums = level2Forums
                .filter(
                  (forum) =>
                    forum.parent_category_id ===
                    "22222222-2222-2222-2222-222222222222"
                )
                .sort((a, b) => (a.region || "").localeCompare(b.region || ""));

              const countries = [];
              if (canadianForums.length > 0) {
                countries.push({ name: "Canada", forums: canadianForums });
              }
              if (usaForums.length > 0) {
                countries.push({ name: "USA", forums: usaForums });
              }

              return countries.map((country) => (
                <div key={country.name} className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    {country.name}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {country.forums.map((forum) => (
                      <Link
                        key={forum.id}
                        href={`/category/${forum.slug}`}
                        className="block"
                      >
                        <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-center space-x-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: forum.color }}
                            />
                            <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                              {forum.region}
                            </h4>
                          </div>
                          {forum.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {forum.description}
                            </p>
                          )}
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No province/state forums available
            </h3>
            <p className="text-muted-foreground">
              Province and state forums will appear here once they are created.
            </p>
          </Card>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ isOpen: false })}
        topicId={reportModal.topicId}
        contentType="topic"
      />
    </div>
  );
}
