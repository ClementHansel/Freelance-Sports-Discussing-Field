"use client";

import ForumRulesEditorTab from "@/components/dashboard/moderator/content/editor/tabs/forum-rules";
import PrivacyEditorTab from "@/components/dashboard/moderator/content/editor/tabs/privacy";
import TermsEditorTab from "@/components/dashboard/moderator/content/editor/tabs/terms";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContentEditorPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Content Editor</h1>

      <Tabs defaultValue="forum" className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="forum" className="flex items-center gap-2">
            Forum Rules
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            Privacy Policy
          </TabsTrigger>
          <TabsTrigger value="terms" className="flex items-center gap-2">
            Terms of Service
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forum">
          <Card className="p-6">
            <ForumRulesEditorTab />
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="p-6">
            <PrivacyEditorTab />
          </Card>
        </TabsContent>

        <TabsContent value="terms">
          <Card className="p-6">
            <TermsEditorTab />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
