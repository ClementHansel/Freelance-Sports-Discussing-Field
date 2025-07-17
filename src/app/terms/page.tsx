import { InlineContentEditor } from "@/components/dashboard/admin/InlineContentEditor";
import React from "react";

export default function Terms() {
  return (
    <InlineContentEditor
      settingKey="terms_content"
      title="Terms & Conditions"
      defaultContent=""
    />
  );
}
