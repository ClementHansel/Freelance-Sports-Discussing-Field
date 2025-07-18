"use client";
import ContentEditor from "@/components/dashboard/admin/content-editor/ContentEditor";
import { Suspense } from "react";

export default function ContentEditorPage() {
  return (
    <Suspense fallback={<div>Loading Content Editor...</div>}>
      <ContentEditor />
    </Suspense>
  );
}
