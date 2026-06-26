import type { Root } from "mdast";
import { defineMdastPlugin } from "satteri";
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

export const pluginExternalLinks = defineMdastPlugin({
	name: "external-links",
	link(node, ctx) {
		if (node.url.startsWith("http")) {
			ctx.setProperty(node, "data", {
				hProperties: {
					target: "_blank",
					rel: "noopener noreferrer",
				},
			});
			ctx.appendChild(node, {
				type: "text",
				value: "⇗",
			});
		}
	},
});
