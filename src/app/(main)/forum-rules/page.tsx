import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { getForumSetting } from "@/lib/getForumSetting";
import { getStaticMarkdown } from "@/lib/static/getStaticMarkdown";

export default async function ForumRulesPage() {
  const fallbackContent = getStaticMarkdown("forumRules.md");
  const content = await getForumSetting("forum_rules", fallbackContent);

  return (
    <div className="prose mx-auto max-w-3xl py-10">
      <h1>Forum Rules</h1>
      <MarkdownRenderer content={content} />
    </div>
  );
}
