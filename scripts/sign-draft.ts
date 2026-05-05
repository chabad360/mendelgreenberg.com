#!/usr/bin/env bun

/*
 * Operational helper that generates signed draft-preview URLs matching the verification logic in `worker.js`. It exists so private drafts can be shared without exposing a general preview UI or relaxing deployment security.
 *
 * Replacement likelihood is medium. A hosted preview system or Cloudflare Access could replace the whole signed-URL workflow, but if this workflow stays then this script is the correct lightweight companion to the worker. Its only critical site-specific requirement is exact agreement with the worker's HMAC format and `/drafts/*` URL shape. Assessment: keep if the worker stays.
 */

const usage = `Usage:
  bun scripts/sign-draft-url.ts --slug <slug> [--base-url <url>] [--ttl <seconds>] [--secret <secret>]

Examples:
  bun scripts/sign-draft-url.ts --slug my-post
  bun scripts/sign-draft-url.ts --slug my-post --ttl 86400
  bun scripts/sign-draft-url.ts --slug notes/deep-dive --base-url https://example.com

Notes:
  - Signature is HMAC-SHA256 over "<path>:<exp>"
  - Defaults: ttl = 86400 (24h), secret = $DRAFT_URL_SECRET`;

function getArg(flag: string): string | undefined {
	const idx = process.argv.indexOf(flag);
	return idx === -1 ? undefined : process.argv[idx + 1];
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
	console.log(usage);
	process.exit(0);
}

const slug = getArg("--slug");
const baseUrl = getArg("--base-url");
const ttlRaw = getArg("--ttl");
const secret = getArg("--secret") ?? process.env.DRAFT_URL_SECRET;

if (!slug) {
	console.error("Error: --slug is required.");
	console.log(usage);
	process.exit(1);
}

if (!secret) {
	console.error(
		"Error: missing signing secret. Provide --secret or set DRAFT_URL_SECRET.",
	);
	process.exit(1);
}

const ttl = ttlRaw ? parseInt(ttlRaw, 10) : 86400;
if (!Number.isFinite(ttl) || ttl <= 0) {
	console.error("Error: --ttl must be a positive integer (seconds).");
	process.exit(1);
}

const normalizedSlug = slug.replace(/^\/+/, "").replace(/\/+$/, "");
const path = `/drafts/${normalizedSlug}`;
const exp = Math.floor(Date.now() / 1000) + ttl;
const payload = `${path}:${exp}`;

const hmac = new Bun.CryptoHasher("sha256", secret);
hmac.update(payload);
const sig = hmac.digest("hex");

const query = `exp=${exp}&sig=${sig}`;
if (baseUrl) {
	console.log(`${baseUrl.replace(/\/+$/, "")}${path}?${query}`);
} else {
	console.log(`${path}?${query}`);
}
console.error(
	`Generated signed URL for "${path}" (expires at ${new Date(exp * 1000).toISOString()})`,
);
