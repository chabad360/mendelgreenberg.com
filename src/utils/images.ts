import type { Root } from "mdast";
import type { VFile } from "vfile";
import { visit } from "unist-util-visit";

export function wikiImageToAstroImage(options: {}) {
  return (tree: Root, file: VFile) => {
    visit(tree, "embed", (node) => {
      console.log(node);
    });
  };
}
