"use client";

import { InlineContentEditor } from "@/components/dashboard/admin/InlineContentEditor";
import React from "react";

export default function PrivacyPage() {
  return (
    <InlineContentEditor
      settingKey="privacy_content"
      title="Privacy Policy"
      defaultContent=""
    />
  );
}
