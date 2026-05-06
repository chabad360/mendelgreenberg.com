// @ts-check
import { defineConfig } from "astro/config";
import { fontProviders } from "astro/config";
import icon from "astro-icon";

// https://astro.build/config
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

  integrations: [icon()],
});
