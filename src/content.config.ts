import { defineCollection, type ImageFunction } from "astro:content";

import { glob } from "astro/loaders";

import { z } from "astro/zod";

const itemSchema = ({ image }: { image: ImageFunction }) =>
	z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),

		image: image().nullish(),
		imageAlt: z.string().nullish(),

		publish: z.boolean(),

		tags: z.string().array().optional(),
		aliases: z.string().array().optional(),
	});

export type ItemSchema = z.infer<typeof itemSchema>;

const posts = defineCollection({
	loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		itemSchema({ image }).extend({
			includeTitleInTOC: z.boolean().optional(),
		}),
});

export const collections = { posts };
