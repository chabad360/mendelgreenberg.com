import { defineCollection } from "astro:content";

import { glob } from "astro/loaders";

import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),

      image: image().nullish(),
      imageAlt: z.string().nullish(),

      publish: z.boolean(),

      tags: z.string().array().optional(),
      aliases: z.string().array().optional(),

      includeTitleInTOC: z.boolean().optional(),
    }),
});

export const collections = { posts };
