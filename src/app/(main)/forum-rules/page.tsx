import fs from "fs";
import path from "path";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { getForumSetting } from "@/lib/getForumSetting";

export default async function ForumRulesPage() {
  const fallbackContent = fs.readFileSync(
    path.join(process.cwd(), "src/data/static/forumRules.md"),
    "utf-8"
  );

  const content = await getForumSetting("forum_rules", fallbackContent);

  return (
    <div className="prose mx-auto max-w-3xl py-10">
      <h1>Forum Rules</h1>
      <MarkdownRenderer content={content} />
    </div>
  );
}
