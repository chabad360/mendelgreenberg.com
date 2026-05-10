import { experimental_getFontFileURL, fontData } from "astro:assets";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import getReadingTime from "reading-time";
import { satoriAstroOG } from "satori-astro";
import { html } from "satori-html";
import { config } from "../../config";

export const getStaticPaths = async () => {
  const posts = (await getCollection("posts"))
    .filter((post) => post.data.publish)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const items = [...posts];

  return items
    .filter((item) => (import.meta.env.PROD ? item.data.publish : true))
    .map((item) => ({
      params: { path: `${item.collection}/${item.id}.png` },
      props: { item },
    }));
};

export const GET: APIRoute = async ({ props: { item }, url }) => {
  const serifPath = fontData["--font-serif"].find(
    (font) =>
      font.src.some((f) => f.format === "truetype") && font.style === "normal",
  )?.src[0]?.url;
  const sansPath = fontData["--font-sans"].find(
    (font) =>
      font.src.some((f) => f.format === "truetype") && font.style === "normal",
  )?.src[0]?.url;

  if (!serifPath || !sansPath) {
    throw new Error(
      `Font paths not found: serif=${serifPath}, sans=${sansPath}`,
    );
  }

  const serifData = await fetch(
    experimental_getFontFileURL(serifPath, url),
  ).then((res) => res.arrayBuffer());

  const sansData = await fetch(experimental_getFontFileURL(sansPath, url)).then(
    (res) => res.arrayBuffer(),
  );

  const color = "#190d00";
  const background = "#fff2e6";
  const sansFamily = "'Instrument Sans', sans-serif";
  const serifFamily = "'Noto Serif', serif";

  return await satoriAstroOG({
    template: html` <div
      style="display: flex; flex-direction: column; background-color: ${background}; color: ${color}; height: 630px; width: 1200px; justify-content: center; text-align: left; padding: 0 5rem;"
    >
      <div
        style="display: flex; flex-direction: column; justify-content: center; align-items: stretch; border-left: 2px solid ${color}; padding: 1.5rem 0; padding-left: 2.5rem;"
      >
        <small
          style="font-family: ${serifFamily}; margin: 0; font-size: 1.5rem; color: ${color};"
        >
          ${item.data.date.toLocaleDateString()} ⋅
          ${getReadingTime(item.body).text}
        </small>
        <h1
          style="font-family: ${sansFamily}; margin-bottom: 0; font-size: 4.5rem;"
        >
          ${item.data.title}
        </h1>
        <h2
          style="font-family: ${serifFamily}; margin-top: 0.25rem; font-size: 3rem;"
        >
          ${item.data.description}
        </h2>
        <p
          style="font-family: ${serifFamily}; margin: 0; margin-top: 2rem; font-size: 2rem;"
        >
          ${config.title}
        </p>
      </div>
    </div>`,
    width: 1200,
    height: 630,
  }).toResponse({
    satori: {
      embedFont: true,
      fonts: [
        {
          name: "Noto Serif",
          data: serifData,
          style: "normal",
        },
        {
          name: "Instrument Sans",
          data: sansData,
          style: "normal",
        },
      ],
      graphemeImages: {
        "⋅": `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2" fill="${color}"/></svg>`)}`,
      },
    },
  });
};
