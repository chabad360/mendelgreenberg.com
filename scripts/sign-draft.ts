#!/usr/bin/env bun
import { argument, option } from "@optique/core/primitives";
import { object } from "@optique/core/constructs";
import { string, integer, url } from "@optique/core/valueparser";
import { bindEnv, createEnvContext } from "@optique/env";
import { optional, withDefault, map } from "@optique/core/modifiers";
import { defineProgram } from "@optique/core/program";
import { run } from "@optique/run";
import { message } from "@optique/core/message";

const envContext = createEnvContext();

const parser = object({
  slug: argument(
    string({
      metavar: "SLUG",
    }),
  ),
  ttl: withDefault(
    option(
      "--ttl",
      integer({
        min: 1,
        metavar: "SECONDS",
      }),
    ),
    86400,
  ),
  secret: bindEnv(
    option(
      "--secret",
      string({
        metavar: "SECRET",
      }),
    ),
    {
      context: envContext,
      key: "DRAFT_URL_SECRET",
      parser: string(),
    },
  ),
  baseUrl: optional(
    bindEnv(option("--base-url", url()), {
      context: envContext,
      key: "BASE_URL",
      parser: url(),
    }),
  ),
});

const program = defineProgram({
  parser,
  metadata: {
    name: "sign-draft-url",
    brief: message`Generate a signed URL for previewing a draft post.`,
  },
});

const { slug, ttl, secret, baseUrl } = await run(program, {
  help: "option",
  colors: true,
  aboveError: "usage",
  contexts: [envContext],
  showDefault: true,
});

const normalizedSlug = slug.replace(/^\/+/, "").replace(/\/+$/, "");
const path = `/drafts/${normalizedSlug}`;
const exp = Math.floor(Date.now() / 1000) + ttl;
const payload = `${path}:${exp}`;

const hmac = new Bun.CryptoHasher("sha256", secret);
hmac.update(payload);
const sig = hmac.digest("hex");

console.error(
  `Generated signed URL for "${path}" (expires at ${new Date(exp * 1000).toISOString()})`,
);
if (baseUrl) {
  baseUrl.searchParams.set("exp", exp.toString());
  baseUrl.searchParams.set("sig", sig);
  baseUrl.pathname = baseUrl.pathname.replace(/\/+$/, "") + path;
  console.log(baseUrl.toString());
} else {
  console.log(`${path}?exp=${exp}&sig=${sig}`);
}
