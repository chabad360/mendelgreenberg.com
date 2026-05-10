// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import wikiLinkPlugin from "@flowershow/remark-wiki-link";
import { defineConfig, fontProviders } from "astro/config";
import icon from "astro-icon";
import rehypeCallouts from "rehype-callouts";
import { config } from "./src/config";
import { remarkWikiImageToAstroImage } from "./src/utils/images";
import { remarkModifiedTime } from "./src/utils/modifiedTime";
import { remarkExternalLinks } from "./src/utils/externalLinks";

export default defineConfig({
  site: config.site,

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
      formats: ["woff2", "ttf"],
    },
    {
      provider: fontProviders.google(),
      // name: "Montserrat",
      name: "Instrument Sans",
      // name: "Roboto",
      cssVariable: "--font-sans",
      formats: ["woff2", "ttf"],
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
    shikiConfig: {
      themes: {
        light: "gruvbox-light-hard",
        dark: "gruvbox-dark-hard",
      },
    },
    remarkPlugins: [
      [wikiLinkPlugin, {}],
      remarkWikiImageToAstroImage,
      remarkModifiedTime,
      remarkExternalLinks,
    ],
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

  integrations: [
    icon(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/drafts/"),
    }),
  ],
});
