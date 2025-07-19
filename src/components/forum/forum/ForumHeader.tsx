"use client";

import React from "react";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useForumSettings } from "@/hooks/useForumSettings";

export function ForumHeader() {
  const { getSetting, isLoading } = useForumSettings();

  const cleanUrl = (url: string) => {
    if (!url || typeof url !== "string") return "";
    return url.replace(/^"(.*)"$/, "$1").trim();
  };

  const isValidUrl = (url: string) =>
    url && (url.startsWith("http://") || url.startsWith("https://"));

  const facebookUrl = cleanUrl(getSetting("social_facebook", ""));
  const twitterUrl = cleanUrl(getSetting("social_twitter", ""));
  const instagramUrl = cleanUrl(getSetting("social_instagram", ""));
  const youtubeUrl = cleanUrl(getSetting("social_youtube", ""));

  const hasValidLinks = [
    facebookUrl,
    twitterUrl,
    instagramUrl,
    youtubeUrl,
  ].some(isValidUrl);

  if (isLoading) return null;

  return (
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

      {hasValidLinks && (
        <div className="flex items-center gap-3 mt-3">
          <span className="text-sm text-muted-foreground">Follow us:</span>
          {isValidUrl(facebookUrl) && (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="facebook"
            >
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary" />
            </a>
          )}
          {isValidUrl(twitterUrl) && (
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="twitter"
            >
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" />
            </a>
          )}
          {isValidUrl(instagramUrl) && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="instagram"
            >
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary" />
            </a>
          )}
          {isValidUrl(youtubeUrl) && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="youtube"
            >
              <Youtube className="h-5 w-5 text-muted-foreground hover:text-primary" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
