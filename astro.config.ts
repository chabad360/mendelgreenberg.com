// @ts-check
import { defineConfig } from "astro/config";
import { fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import rehypeCallouts from "rehype-callouts";
import wikiLinkPlugin from "@flowershow/remark-wiki-link";
import { remarkWikiImageToAstroImage } from "./src/utils/images";

export default defineConfig({
  redirects: {
    "/posts": "/posts/1",
    "/": "/posts",
  },

  fonts: [
    {
      provider: fontProviders.google(),
      // name: "IBM Plex Serif",
      name: "Noto Serif",
      cssVariable: "--font-serif",
    },
    {
      provider: fontProviders.google(),
      // name: "Montserrat",
      name: "Instrument Sans",
      // name: "Roboto",
      cssVariable: "--font-sans",
    },
  ],

  image: {
    responsiveStyles: true,
    layout: "full-width",
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },

  markdown: {
    remarkPlugins: [[wikiLinkPlugin, {}], remarkWikiImageToAstroImage],
    rehypePlugins: [
      [
        rehypeCallouts,
        {
          showIndicator: false,
          tags: {
            contentTagName: "aside",
          },
        },
      ],
    ],
  },

  integrations: [icon(), mdx()],
});
