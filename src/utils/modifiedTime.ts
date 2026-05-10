import type { VFile } from "vfile";
import { statSync } from "node:fs";
import type { RemarkPlugin } from "@astrojs/markdown-remark";

export const remarkModifiedTime: RemarkPlugin = () => {
  return (_, file: VFile) => {
    if (!file.data.astro?.frontmatter) return;

    const filepath = file.history[0];
    const result = statSync(filepath);
    file.data.astro.frontmatter.lastModified = result.mtime.toISOString();
  };
};
