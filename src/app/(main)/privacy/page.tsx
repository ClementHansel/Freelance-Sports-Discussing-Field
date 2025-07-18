import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { getForumSetting } from "@/lib/getForumSetting";
import { getStaticMarkdown } from "@/lib/static/getStaticMarkdown";

export default async function PrivacyPage() {
  const fallbackContent = getStaticMarkdown("privacy.md");
  const content = await getForumSetting("privacy_content", fallbackContent);

  return (
    <div className="prose mx-auto max-w-3xl py-10">
      <h1>Privacy Policy</h1>
      <MarkdownRenderer content={content} />
    </div>
  );
}
