import { experimental_getFontFileURL, fontData } from "astro:assets";
import type { APIRoute } from "astro";
import { satoriAstroOG } from "satori-astro";
import { html } from "satori-html";
import pngToIco from "png-to-ico";

export const getStaticPaths = async () => {
  return [
    {
      params: {
        ext: "svg",
      },
    },
    {
      params: {
        ext: "ico",
      },
    },
  ];
};

export const GET: APIRoute = async ({ params: { ext }, url }) => {
  const sansPath = fontData["--font-sans"].find(
    (font) =>
      font.src.some((f) => f.format === "truetype") && font.style === "normal",
  )?.src[0]?.url;

  if (!sansPath) {
    throw new Error(`Font paths not found: sans=${sansPath}`);
  }
  const sansData = await fetch(experimental_getFontFileURL(sansPath, url)).then(
    (res) => res.arrayBuffer(),
  );

  const color = "#190d00";
  const background = "#fff2e6";
  const sansFamily = "'Instrument Sans', sans-serif";

  const satori = satoriAstroOG({
    template: html` <div
      style="display: flex; flex-direction: column; background-color: ${background}; color: ${color}; height: 256; width: 256px; justify-content: center; align-content: center; text-align: center; font-family: ${sansFamily}; font-size: 156px;"
    >
      <span style="vertical-align: middle;">MG</span>
    </div>`,
    width: 256,
    height: 256,
  });

  if (ext === "ico") {
    const png = await satori.toImage({
      satori: {
        embedFont: true,
        fonts: [
          {
            name: "Instrument Sans",
            data: sansData,
            style: "normal",
          },
        ],
      },
    });

    const icoBuf = await pngToIco(png);

    // pngToIco returns a buffer, which we can return directly in the response
    return new Response(icoBuf, {
      headers: {
        "Content-Type": "image/x-icon",
      },
    });
  } else if (ext === "svg") {
    const svg = await satori.toSvg({
      embedFont: true,
      fonts: [
        {
          name: "Instrument Sans",
          data: sansData,
          style: "normal",
        },
      ],
    });

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });
  }

  return new Response("Not found", {
    status: 404,
  });
};
