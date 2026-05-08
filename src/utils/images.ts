import type { Data, Node, Root, Image } from "mdast";
import { visit } from "unist-util-visit";
import type { Properties } from "hast";

interface wikiEmbedNode extends Node {
  type: "embed";
  value: string;
  data: Data & {
    existing: boolean;
    path: string;
  };
}

interface wikiImageProperties extends Properties {
  src: string;
  alt: string;
  className?: string | string[];
  "data-fs-width"?: string;
  "data-fs-height"?: string;
}

interface wikiImageNode extends wikiEmbedNode {
  data: wikiEmbedNode["data"] & {
    hName: "img";
    hProperties: wikiImageProperties;
  };
}

export function remarkWikiImageToAstroImage() {
  return (tree: Root) => {
    visit(tree, "embed", (node: wikiImageNode) => {
      if (node.data.hName !== "img") {
        return;
      }

      const image: Image = {
        type: "image",
        title: null,
        url: node.data.path,
        alt: node.data.hProperties.alt,
        position: node.position,
        data: {},
      };

      Object.assign(node, image);
    });
  };
}
