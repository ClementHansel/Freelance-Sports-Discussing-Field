"use client";

import React, { useEffect } from "react";

interface SidebarAdBannerProps {
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export const SidebarAdBanner: React.FC<SidebarAdBannerProps> = ({
  className = "",
}) => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full min-w-[300px] max-w-[300px] mx-auto">
        <div className="text-center text-xs text-muted-foreground mb-2">
          Advertisement
        </div>
        <ins
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%",
            minHeight: "250px",
          }}
          data-ad-client="ca-pub-5447109336224364"
          data-ad-slot="4012372906"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    </div>
  );
};
