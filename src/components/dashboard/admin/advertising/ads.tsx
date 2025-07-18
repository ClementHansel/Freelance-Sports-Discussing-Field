"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdSpaceManager } from "@/components/dashboard/admin/advertising/AdSpaceManager";
import { HeaderScriptsManager } from "@/components/dashboard/admin/advertising/HeaderScriptsManager";
import { AdAnalytics } from "@/components/dashboard/admin/advertising/AdAnalytics";
import { AdvertisingSettings } from "@/components/dashboard/admin/advertising/AdvertisingSettings";

export default function Ads() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advertising Management</h1>
        <p className="text-muted-foreground">
          Manage ad spaces, header scripts, and advertising settings for your
          forum.
        </p>
      </div>

      <Tabs defaultValue="spaces" className="space-y-4">
        <TabsList>
          <TabsTrigger value="spaces">Ad Spaces</TabsTrigger>
          <TabsTrigger value="scripts">Header Scripts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="spaces">
          <AdSpaceManager />
        </TabsContent>

        <TabsContent value="scripts">
          <HeaderScriptsManager />
        </TabsContent>

        <TabsContent value="analytics">
          <AdAnalytics />
        </TabsContent>

        <TabsContent value="settings">
          <AdvertisingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
