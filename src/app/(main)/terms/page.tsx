import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { getForumSetting } from "@/lib/getForumSetting";
import { getStaticMarkdown } from "@/lib/static/getStaticMarkdown";

export default async function PrivacyPage() {
  const fallbackContent = getStaticMarkdown("terms.md");
  const content = await getForumSetting("terms_content", fallbackContent);

  return (
    <div className="prose mx-auto max-w-3xl py-10">
      <h1>Terms & Conditions</h1>
      <MarkdownRenderer content={content} />
    </div>
  );
}
