"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Tag, Home } from "lucide-react";
import { HomePageSeoManager } from "@/components/dashboard/admin/seo/tabs/HomePageSeoManager";
import { CategorySeoManager } from "@/components/dashboard/admin/seo/tabs/CategorySeoManager";
import { TopicSeoManager } from "@/components/dashboard/admin/seo/tabs/TopicSeoManager";

export default function Seo() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SEO Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage SEO metadata for categories and topics to improve search engine
          optimization
        </p>
      </div>

      <Tabs defaultValue="home" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="home" className="gap-2">
            <Home className="h-4 w-4" />
            Home Page
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Tag className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="topics" className="gap-2">
            <Search className="h-4 w-4" />
            Topics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="space-y-6">
          <HomePageSeoManager />
        </TabsContent>
        <TabsContent value="categories" className="space-y-6">
          <CategorySeoManager />
        </TabsContent>
        <TabsContent value="topics" className="space-y-6">
          <TopicSeoManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
