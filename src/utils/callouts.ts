import { defineMdastPlugin, markdownToHtml } from "satteri";

const calloutRegex = /^\s*\[!(\w+)\]([-+]?)\s?(.*?)?\n/;

export const pluginCallouts = defineMdastPlugin({
	name: "obsidian-callouts",
	blockquote(node, ctx) {
		const text = node.children
			.find((child) => child.type === "paragraph")
			?.children.find((child) => child.type === "text");
		const isCallout = text?.value.match(calloutRegex);
		if (!isCallout || !text) {
			return;
		}
		const calloutTitle = isCallout[3]?.trim() || isCallout[1];
		const calloutText = text.value.replace(calloutRegex, "");

		if (isCallout[2] === "-" || isCallout[2] === "+") {
			ctx.replaceNode(node, {
				type: "html",
				value: `<details 
          ${calloutTitle !== isCallout[1] ? `id="${calloutTitle.toLowerCase().replace(/\s+/g, "-")}"` : ""}
           class="callout callout-${isCallout[1]}" 
           data-collapsible="true" ${isCallout[2] === "+" ? "open" : ""}
           >
            <summary>${calloutTitle} <span class="callout-fold-icon">▸</span></summary>
            <p>${markdownToHtml(calloutText || "").html}</p>
          </details>`,
			});
		} else {
			ctx.replaceNode(node, {
				type: "html",
				value: `<aside 
          ${calloutTitle !== isCallout[1] ? `id="${calloutTitle.toLowerCase().replace(/\s+/g, "-")}"` : ""} 
          class="callout callout-${isCallout[1]}"
          >
            <summary>${calloutTitle}</summary>
            <p>${markdownToHtml(calloutText || "").html}</p>
          </aside>`,
			});
		}

		// console.log("Processing callout node:", JSON.stringify(node, null, 2));
	},
});
