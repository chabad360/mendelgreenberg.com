/*
 * Cloudflare Worker entrypoint that protects `/drafts/*` with signed URLs while letting all other requests fall through to static assets. It exists so unpublished posts can be shared without opening the whole site or requiring a full authenticated preview system.
 *
 * Replacement likelihood is medium. Off-the-shelf alternatives include Cloudflare Access, preview deploys, or platform-native password protection, but this file is unusually small for what it provides. Its main site-specific requirement is staying in lockstep with `scripts/sign-draft-url.ts` and the `/drafts/*` asset routing in `wrangler.toml`. Assessment: keep if signed draft sharing matters; otherwise replace with a managed preview mechanism.
 */

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const pathname = normalizePath(url.pathname);

		// Only gate draft routes
		if (!pathname.startsWith("/drafts/")) {
			return env.ASSETS.fetch(request);
		}

		// Enforce signed URL on /drafts/*
		const exp = url.searchParams.get("exp");
		const sig = url.searchParams.get("sig");
		const secret = env.DRAFT_URL_SECRET;

		const valid =
			typeof secret === "string" &&
			typeof exp === "string" &&
			typeof sig === "string" &&
			(await isValidSignature(pathname, exp, sig, secret));

		if (!valid) {
			// Return 404 to avoid leaking that draft content exists
			return notFound(env, request);
		}

		// Signature valid -> serve static draft page from assets
		return env.ASSETS.fetch(request);
	},
};

function normalizePath(pathname) {
	if (!pathname || pathname === "/") return "/";
	// Collapse duplicate slashes and remove trailing slash (except root)
	const collapsed = pathname.replace(/\/{2,}/g, "/");
	return collapsed.length > 1 ? collapsed.replace(/\/+$/, "") : collapsed;
}

async function isValidSignature(path, exp, sig, secret) {
	const expNum = Number.parseInt(exp, 10);
	const now = Math.floor(Date.now() / 1000);

	if (!Number.isFinite(expNum) || expNum <= now) {
		return false;
	}

	const payload = `${path}:${exp}`;
	const expected = await hmacSha256Hex(secret, payload);

	return timingSafeEqualHex(expected, sig.toLowerCase());
}

async function hmacSha256Hex(secret, payload) {
	const keyData = new TextEncoder().encode(secret);
	const data = new TextEncoder().encode(payload);

	const key = await crypto.subtle.importKey(
		"raw",
		keyData,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const signature = await crypto.subtle.sign("HMAC", key, data);
	return bytesToHex(new Uint8Array(signature));
}

function bytesToHex(bytes) {
	let out = "";
	for (let i = 0; i < bytes.length; i++) {
		out += bytes[i].toString(16).padStart(2, "0");
	}
	return out;
}

function timingSafeEqualHex(a, b) {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) {
		diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return diff === 0;
}

async function notFound(env, request) {
	// Try your custom 404 page first (works with not_found_handling = "404-page")
	const notFoundUrl = new URL(request.url);
	notFoundUrl.pathname = "/404";
	notFoundUrl.search = "";

	const notFoundReq = new Request(notFoundUrl.toString(), request);
	const res = await env.ASSETS.fetch(notFoundReq);

	if (res.status === 200) {
		return new Response(res.body, {
			status: 404,
			headers: res.headers,
		});
	}

	// Fallback minimal 404
	return new Response("Not Found", { status: 404 });
}
