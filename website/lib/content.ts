import fs from "fs";
import path from "path";

export function readDocsMarkdown(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), "..", "docs", relativePath), "utf-8");
}
