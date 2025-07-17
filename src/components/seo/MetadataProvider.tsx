"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useForumSettings } from "@/hooks/useForumSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/components/integrations/supabase/client";

interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

interface MetadataContextType {
  setPageMetadata: (metadata: PageMetadata) => void;
}

const MetadataContext = createContext<MetadataContextType | null>(null);

export const useMetadata = () => {
  const context = useContext(MetadataContext);
  if (!context)
    throw new Error("useMetadata must be used within MetadataProvider");
  return context;
};

interface MetadataProviderProps {
  children: ReactNode;
}

export const MetadataProvider: React.FC<MetadataProviderProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const { getSetting } = useForumSettings();
  const { user } = useAuth();
  const [customMetadata, setCustomMetadata] = useState<PageMetadata>({});

  const setPageMetadata = (metadata: PageMetadata) => {
    setCustomMetadata(metadata);
  };

  const categorySlug = params?.categorySlug as string | undefined;
  const subcategorySlug = params?.subcategorySlug as string | undefined;
  const topicSlug = params?.topicSlug as string | undefined;

  const { data: categoryMetadata } = useQuery({
    queryKey: ["category-metadata", categorySlug],
    queryFn: async () => {
      if (!categorySlug) return null;
      const { data } = await supabase
        .from("categories")
        .select(
          "name, meta_title, meta_description, meta_keywords, canonical_url, og_title, og_description, og_image"
        )
        .eq("slug", categorySlug)
        .single();
      return data;
    },
    enabled: !!categorySlug,
  });

  const { data: topicMetadata } = useQuery({
    queryKey: ["topic-metadata", categorySlug, subcategorySlug, topicSlug],
    queryFn: async () => {
      if (!topicSlug || !categorySlug) return null;

      type CategoryData = { id: string };

      let categoryData: CategoryData | null = null;

      if (subcategorySlug) {
        const { data: parentCategory, error: parentError } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categorySlug)
          .single();

        if (parentError || !parentCategory) return null;

        const { data: childCategory, error: childError } = await supabase
          .from("categories")
          .select("id, parent_category_id")
          .eq("slug", subcategorySlug)
          .eq("parent_category_id", parentCategory.id)
          .single();

        if (childError || !childCategory) return null;

        categoryData = childCategory;
      } else {
        const { data, error } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categorySlug)
          .single();

        if (error || !data) return null;

        categoryData = data;
      }

      if (!categoryData?.id) return null;

      const { data: topicData, error: topicError } = await supabase
        .from("topics")
        .select(
          "meta_title, meta_description, meta_keywords, canonical_url, og_title, og_description, og_image, title, content"
        )
        .eq("slug", topicSlug)
        .eq("category_id", categoryData.id)
        .single();

      if (topicError || !topicData) return null;

      return topicData;
    },
    enabled: !!categorySlug && !!topicSlug,
  });

  const { data: profileData } = useQuery({
    queryKey: ["profile-metadata", user?.id],
    queryFn: async () => {
      if (!user?.id || pathname !== "/profile") return null;
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id && pathname === "/profile",
  });

  const getPageMetadata = (): PageMetadata => {
    const baseTitle = getSetting("forum_name", "Minor Hockey Talks");
    const baseSeparator = " - ";

    if (Object.keys(customMetadata).length > 0) {
      return {
        title: customMetadata.title
          ? `${customMetadata.title}${baseSeparator}${baseTitle}`
          : undefined,
        ...customMetadata,
      };
    }

    if (topicMetadata && topicSlug) {
      return {
        title:
          topicMetadata.meta_title ||
          `${topicMetadata.title}${baseSeparator}${baseTitle}`,
        description:
          topicMetadata.meta_description ||
          topicMetadata.content?.substring(0, 160),
        keywords: topicMetadata.meta_keywords ?? undefined,
        canonical: topicMetadata.canonical_url ?? undefined,
        ogTitle: topicMetadata.og_title || topicMetadata.title,
        ogDescription:
          (topicMetadata.og_description || topicMetadata.meta_description) ??
          undefined,
        ogImage: topicMetadata.og_image ?? undefined,
      };
    }

    if (categoryMetadata && categorySlug) {
      return {
        title:
          categoryMetadata.meta_title ||
          `${
            categoryMetadata.name || categorySlug
          }${baseSeparator}${baseTitle}`,
        description: categoryMetadata.meta_description ?? undefined,
        keywords: categoryMetadata.meta_keywords ?? undefined,
        canonical: categoryMetadata.canonical_url ?? undefined,
        ogTitle: categoryMetadata.og_title ?? undefined,
        ogDescription: categoryMetadata.og_description ?? undefined,
        ogImage: categoryMetadata.og_image ?? undefined,
      };
    }

    const searchQuery = searchParams.get("q");
    const path = pathname;

    if (path === "/") {
      return {
        title: getSetting("seo_home_title", baseTitle),
        description: getSetting(
          "seo_home_description",
          "Join the leading online community for minor hockey players, parents, and coaches."
        ),
        keywords: getSetting(
          "seo_home_keywords",
          "minor hockey, youth hockey, hockey community"
        ),
        canonical: getSetting("seo_home_canonical_url", ""),
        ogTitle: getSetting("seo_home_og_title", ""),
        ogDescription: getSetting("seo_home_og_description", ""),
        ogImage: getSetting("seo_home_og_image", ""),
      };
    }

    if (path === "/search") {
      const title = searchQuery
        ? `Search results for "${searchQuery}"${baseSeparator}${baseTitle}`
        : `Search${baseSeparator}${baseTitle}`;
      return {
        title,
        description: searchQuery
          ? `Search results for "${searchQuery}" on ${baseTitle}`
          : `Search topics and discussions on ${baseTitle}`,
      };
    }

    if (path === "/profile") {
      const username = profileData?.username || "User";
      return {
        title: `${username}'s Profile${baseSeparator}${baseTitle}`,
        description: `View ${username}'s profile, posts, and activity on ${baseTitle}`,
      };
    }

    if (path.startsWith("/admin")) {
      const section = path.split("/")[2];
      const sectionTitles: Record<string, string> = {
        users: "User Management",
        content: "Content Management",
        moderation: "Moderation",
        spam: "Spam Management",
        seo: "SEO Settings",
        settings: "Settings",
      };
      const sectionTitle = sectionTitles[section] || "Dashboard";
      return {
        title: `Admin ${sectionTitle}${baseSeparator}${baseTitle}`,
        description: `Admin panel - ${sectionTitle} for ${baseTitle}`,
      };
    }

    const staticPages: Record<string, { title: string; description: string }> =
      {
        "/topics": {
          title: `All Topics${baseSeparator}${baseTitle}`,
          description: `Browse all topics and discussions on ${baseTitle}`,
        },
        "/categories": {
          title: `Categories${baseSeparator}${baseTitle}`,
          description: `Browse all discussion categories on ${baseTitle}`,
        },
        "/settings": {
          title: `Account Settings${baseSeparator}${baseTitle}`,
          description: `Manage your account settings and preferences on ${baseTitle}`,
        },
        "/login": {
          title: `Login${baseSeparator}${baseTitle}`,
          description: `Sign in to your ${baseTitle} account`,
        },
        "/register": {
          title: `Register${baseSeparator}${baseTitle}`,
          description: `Create a new account on ${baseTitle}`,
        },
        "/create": {
          title: `Create Topic${baseSeparator}${baseTitle}`,
          description: `Start a new discussion on ${baseTitle}`,
        },
        "/terms": {
          title: `Terms of Service${baseSeparator}${baseTitle}`,
          description: `Terms of service and user agreement for ${baseTitle}`,
        },
        "/privacy": {
          title: `Privacy Policy${baseSeparator}${baseTitle}`,
          description: `Privacy policy and data protection information for ${baseTitle}`,
        },
        "/blog": {
          title: `Blog${baseSeparator}${baseTitle}`,
          description: `Latest news and updates from ${baseTitle}`,
        },
      };

    if (staticPages[path]) return staticPages[path];

    return {
      title: baseTitle,
      description:
        "Join the leading online community for minor hockey players, parents, and coaches.",
    };
  };

  const metadata = getPageMetadata();

  return (
    <MetadataContext.Provider value={{ setPageMetadata }}>
      <Head>
        {metadata.title && <title>{metadata.title}</title>}
        {metadata.description && (
          <meta name="description" content={metadata.description} />
        )}
        {metadata.keywords && (
          <meta name="keywords" content={metadata.keywords} />
        )}
        {metadata.canonical && (
          <link rel="canonical" href={metadata.canonical} />
        )}
        {metadata.ogTitle && (
          <meta property="og:title" content={metadata.ogTitle} />
        )}
        {metadata.ogDescription && (
          <meta property="og:description" content={metadata.ogDescription} />
        )}
        {metadata.ogImage && (
          <meta property="og:image" content={metadata.ogImage} />
        )}
        {metadata.ogTitle && (
          <meta name="twitter:title" content={metadata.ogTitle} />
        )}
        {metadata.ogDescription && (
          <meta name="twitter:description" content={metadata.ogDescription} />
        )}
        {metadata.ogImage && (
          <meta name="twitter:image" content={metadata.ogImage} />
        )}
      </Head>
      {children}
    </MetadataContext.Provider>
  );
};
