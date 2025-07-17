import fs from "fs";
import path from "path";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { getForumSetting } from "@/lib/getForumSetting";

export default async function PrivacyPage() {
  const fallbackContent = fs.readFileSync(
    path.join(process.cwd(), "src/data/static/privacy.md"),
    "utf-8"
  );

  const content = await getForumSetting("privacy_content", fallbackContent);

  return (
    <div className="prose mx-auto max-w-3xl py-10">
      <h1>Privacy Policy</h1>
      <MarkdownRenderer content={content} />
    </div>
  );
}
