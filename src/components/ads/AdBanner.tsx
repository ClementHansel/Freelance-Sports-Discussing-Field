"use client";

import React, { useEffect, useRef } from "react";

interface AdBannerProps {
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export const AdBanner: React.FC<AdBannerProps> = ({ className = "" }) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        if (typeof window !== "undefined" && window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`w-full my-6 ${className}`}>
      <div className="flex justify-center px-4">
        <div className="w-full min-w-[320px] max-w-[728px]">
          <div className="text-center text-xs text-muted-foreground mb-2">
            Advertisement
          </div>
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block", width: "100%", minHeight: "90px" }}
            data-ad-client="ca-pub-5447109336224364"
            data-ad-slot="2511588978"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </div>
  );
};
