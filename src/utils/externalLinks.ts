import type { Root } from "mdast";
import { visit } from "unist-util-visit";

export function remarkExternalLinks() {
	return (tree: Root) => {
		visit(tree, "link", (node) => {
			if (node.url.startsWith("http")) {
				node.data = {
					hProperties: {
						target: "_blank",
						rel: "noopener noreferrer",
					},
				};

				node.children.push({
					type: "text",
					value: "⇗",
				});
			}
		});
	};
}
