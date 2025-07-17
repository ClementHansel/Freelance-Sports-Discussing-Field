"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { WysiwygEditor } from "@/components/ui/wysiwyg-editor";
import { HTMLRenderer } from "@/components/ui/html-renderer";
import { useForumSettings } from "@/hooks/useForumSettings";
import { usePermissions } from "@/hooks/usePermissions";
import { Edit3, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InlineContentEditorProps {
  settingKey: string;
  title: string;
  defaultContent?: string;
}

export const InlineContentEditor: React.FC<InlineContentEditorProps> = ({
  settingKey,
  title,
  defaultContent = "",
}) => {
  const { getSetting, updateSetting, isUpdating } = useForumSettings();
  const { canViewAdminPanel } = usePermissions();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const content = getSetting(settingKey, defaultContent);

  const cleanHtmlForEditor = (htmlContent: string) => {
    if (!htmlContent) return "";

    const cleaned = htmlContent
      .replace(/\s*data-start="[^"]*"/g, "")
      .replace(/\s*data-end="[^"]*"/g, "")
      .replace(/\s*data-placeholder="[^"]*"/g, "")
      .replace(/\s*contenteditable="[^"]*"/g, "")
      .trim();

    return cleaned;
  };

  const handleEdit = () => {
    const rawContent = content || defaultContent;
    const cleanedContent = cleanHtmlForEditor(rawContent);
    setEditContent(cleanedContent);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateSetting({
        key: settingKey,
        value: editContent,
        type: "code",
        category: "legal",
        description: `${title} content`,
      });
      setIsEditing(false);
      toast({
        title: "Content Updated",
        description: `${title} has been saved successfully.`,
      });
    } catch {
      toast({
        title: "Error",
        description: `Failed to save ${title.toLowerCase()}.`,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditContent("");
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        {canViewAdminPanel && !isEditing && (
          <Button
            onClick={handleEdit}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Editor */}
          <div>
            <WysiwygEditor
              value={editContent}
              onChange={setEditContent}
              height={400}
              placeholder={`Enter ${title.toLowerCase()} content here...`}
              allowImages={true}
            />
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleSave}
                disabled={isUpdating}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isUpdating}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Live Preview</h2>
            <div className="prose prose-slate max-w-none border rounded p-4 bg-white shadow overflow-auto h-[400px]">
              <HTMLRenderer content={editContent} />
            </div>
          </div>
        </div>
      ) : (
        <div className="prose prose-slate max-w-none">
          {content ? (
            <HTMLRenderer content={content} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {title} content is not available.
              </p>
            </div>
          )}
        </div>
      )}

      {!isEditing && (
        <div className="border-t pt-6 mt-8">
          <p className="text-sm text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};
