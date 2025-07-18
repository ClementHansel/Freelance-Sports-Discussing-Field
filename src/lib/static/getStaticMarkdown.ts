// src/lib/static/getStaticMarkdown.ts
import fs from "fs";
import path from "path";

export function getStaticMarkdown(file: string): string {
  const filePath = path.join(process.cwd(), "src/data/static", file);
  return fs.readFileSync(filePath, "utf-8");
}
