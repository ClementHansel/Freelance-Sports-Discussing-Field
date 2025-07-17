"use client";
import { useEffect } from "react";
import { useForumSettings } from "@/hooks/useForumSettings";

export default function AdsTxtPage() {
  const { getSetting } = useForumSettings();
  const adsTxtContent = getSetting("ads_txt_content", "");

  useEffect(() => {
    // Set content type to plain text
    document.querySelector('meta[http-equiv="Content-Type"]')?.remove();
    const metaTag = document.createElement("meta");
    metaTag.setAttribute("http-equiv", "Content-Type");
    metaTag.setAttribute("content", "text/plain; charset=utf-8");
    document.head.appendChild(metaTag);

    return () => {
      metaTag.remove();
    };
  }, []);

  return (
    <pre
      style={{
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        margin: 0,
        padding: 0,
        background: "white",
        color: "black",
      }}
    >
      {adsTxtContent || "# No ads.txt content configured"}
    </pre>
  );
}
