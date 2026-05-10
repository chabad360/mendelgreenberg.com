import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { config } from "../config";

export const GET: APIRoute = async () => {
	const posts = (await getCollection("posts"))
		.filter((post) => post.data.publish)
		.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

	const items = [...posts];

	return rss({
		title: config.title,
		description: config.description,
		site: config.site,
		items: items.map((item) => ({
			title: item.data.title,
			pubDate: item.data.date,
			description: item.data.description,
			link: `/${item.collection}/${item.id}`,
		})),
		customData: `<language>en-us</language>`,
	});
};
