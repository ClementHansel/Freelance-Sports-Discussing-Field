"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getRedirectUrl } from "@/utils/urlRedirects";
import { migrateUrl } from "@/utils/urlMigration";

export const RedirectHandler = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Perform URL migration check
    const migratedUrl = migrateUrl(pathname);
    if (migratedUrl && migratedUrl !== pathname) {
      router.replace(migratedUrl);
      return;
    }

    const segments = pathname.split("/").filter(Boolean);
    const [categorySlug, subcategorySlug, topicSlug] = segments;

    // Handle category redirect
    if (categorySlug) {
      const newCategorySlug = getRedirectUrl(categorySlug);
      if (newCategorySlug) {
        let newPath = `/${newCategorySlug}`;

        if (subcategorySlug) {
          const newSubSlug = getRedirectUrl(subcategorySlug);
          newPath += `/${newSubSlug || subcategorySlug}`;

          if (topicSlug) {
            newPath += `/${topicSlug}`;
          }
        } else if (topicSlug) {
          newPath += `/${topicSlug}`;
        }

        if (newPath !== pathname) {
          router.replace(newPath);
          return;
        }
      }
    }

    // Handle orphaned subcategory
    if (!categorySlug && subcategorySlug) {
      const newSubSlug = getRedirectUrl(subcategorySlug);
      if (newSubSlug) {
        let newPath = `/${newSubSlug}`;
        if (topicSlug) {
          newPath += `/${topicSlug}`;
        }

        if (newPath !== pathname) {
          router.replace(newPath);
        }
      }
    }
  }, [pathname, router]);

  return null;
};
