// supabase/functions/analytics-appstore/index.ts
// Proxy for App Store Connect API v1
// Decrypts project credentials from Supabase Vault, generates JWT for Apple auth

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ASC_BASE = "https://api.appstoreconnect.apple.com/v1";
const CACHE_TTL = 300; // 5 minutes

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonError("Missing Authorization header", 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return jsonError("Unauthorized", 401);

    // ── Parse request ────────────────────────────────────────────────────
    const { projectId, endpoint, params } = (await req.json()) as {
      projectId: string;
      endpoint: string;
      params?: Record<string, string>;
    };

    if (!projectId || !endpoint) {
      return jsonError("Missing projectId or endpoint", 400);
    }

    const allowed = ["apps/{appId}/appStoreReviewDetails", "ratings", "reviews"];
    if (!allowed.includes(endpoint)) {
      return jsonError(`Endpoint "${endpoint}" not allowed`, 400);
    }

    // ── Get token from Vault ─────────────────────────────────────────────
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Verify project belongs to user
    const { data: project, error: projErr } = await serviceClient
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projErr || !project) return jsonError("Project not found", 404);

    // Get vault secret id
    const { data: integration, error: intErr } = await serviceClient
      .from("project_integrations")
      .select("vault_secret_id, metadata")
      .eq("project_id", projectId)
      .eq("provider", "appstore")
      .single();

    if (intErr || !integration) {
      return jsonError("App Store Connect integration not configured", 404);
    }

    // Decrypt from Vault
    const { data: secretRow, error: vaultErr } = await serviceClient
      .rpc("vault_decrypt_secret", { secret_id: integration.vault_secret_id })
      .maybeSingle();

    if (vaultErr || !secretRow) {
      return jsonError("Could not decrypt App Store Connect credentials", 500);
    }
    const raw: string = (secretRow as { decrypted_secret: string }).decrypted_secret;

    // Credentials stored as JSON: { issuerId, keyId, privateKey }
    let creds: { issuerId: string; keyId: string; privateKey: string };
    try {
      creds = JSON.parse(raw);
    } catch {
      return jsonError(
        "Invalid App Store Connect credentials — please reconnect in Settings",
        500,
      );
    }

    // ── Generate Apple JWT ───────────────────────────────────────────────
    const jwt = await generateAppleJWT(creds.issuerId, creds.keyId, creds.privateKey);

    // ── Build URL & proxy ────────────────────────────────────────────────
    const bundleId = (integration.metadata as Record<string, string>)?.bundleId ?? "";

    let data: unknown;

    if (endpoint === "ratings") {
      data = await fetchRatings(jwt, bundleId);
    } else if (endpoint === "reviews") {
      const limit = params?.limit ?? "20";
      data = await fetchReviews(jwt, bundleId, limit);
    } else {
      return jsonError(`Endpoint "${endpoint}" not implemented`, 400);
    }

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${CACHE_TTL}`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonError(message, 500);
  }
});

// ── Apple JWT (ES256) ────────────────────────────────────────────────────────

async function generateAppleJWT(
  issuerId: string,
  keyId: string,
  privateKeyPem: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", kid: keyId, typ: "JWT" };
  const payload = {
    iss: issuerId,
    iat: now,
    exp: now + 20 * 60, // 20 minutes
    aud: "appstoreconnect-v1",
  };

  const enc = new TextEncoder();
  const headerB64 = base64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64url(enc.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await importPKCS8(privateKeyPem);
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    enc.encode(signingInput),
  );

  // Convert DER signature to raw r||s (64 bytes)
  const rawSig = derToRaw(new Uint8Array(sig));
  return `${signingInput}.${base64url(rawSig)}`;
}

async function importPKCS8(pem: string): Promise<CryptoKey> {
  const pemBody = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");

  const binary = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "pkcs8",
    binary,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

/**
 * Convert DER-encoded ECDSA signature to raw 64-byte r||s format.
 */
function derToRaw(der: Uint8Array): Uint8Array {
  // DER: 0x30 <len> 0x02 <rLen> <r> 0x02 <sLen> <s>
  let offset = 2; // skip 0x30 + total length
  if (der[offset] !== 0x02) throw new Error("Invalid DER signature");
  offset++;
  const rLen = der[offset++];
  const r = der.slice(offset, offset + rLen);
  offset += rLen;
  if (der[offset] !== 0x02) throw new Error("Invalid DER signature");
  offset++;
  const sLen = der[offset++];
  const s = der.slice(offset, offset + sLen);

  const raw = new Uint8Array(64);
  raw.set(r.length > 32 ? r.slice(r.length - 32) : r, 32 - Math.min(r.length, 32));
  raw.set(s.length > 32 ? s.slice(s.length - 32) : s, 64 - Math.min(s.length, 32));
  return raw;
}

function base64url(bytes: Uint8Array): string {
  const str = btoa(String.fromCharCode(...bytes));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ── App Store Connect endpoints ──────────────────────────────────────────────

async function resolveAppId(jwt: string, bundleId: string): Promise<string> {
  const url = `${ASC_BASE}/apps?filter[bundleId]=${encodeURIComponent(bundleId)}&fields[apps]=bundleId`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`App Store Connect apps lookup failed (${res.status}): ${text}`);
  }
  const body = await res.json();
  const apps = body.data as Array<{ id: string }>;
  if (!apps?.length) throw new Error(`No app found with bundleId "${bundleId}"`);
  return apps[0].id;
}

async function fetchRatings(
  jwt: string,
  bundleId: string,
): Promise<{
  average: number;
  total: number;
  distribution: Record<string, number>;
}> {
  const appId = await resolveAppId(jwt, bundleId);

  // Customer Reviews summary is available via the app's customerReviews resource
  // We fetch recent reviews and compute an aggregate
  const url = `${ASC_BASE}/apps/${appId}/customerReviews?sort=-createdDate&limit=200&fields[customerReviews]=rating,title,body,createdDate,reviewerNickname`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`App Store Connect reviews failed (${res.status}): ${text}`);
  }

  const body = await res.json();
  const reviews = (body.data ?? []) as Array<{
    attributes: { rating: number };
  }>;

  const distribution: Record<string, number> = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };
  let total = 0;
  let sum = 0;
  for (const r of reviews) {
    const rating = r.attributes.rating;
    distribution[String(rating)] = (distribution[String(rating)] ?? 0) + 1;
    sum += rating;
    total++;
  }

  return {
    average: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
    total,
    distribution,
  };
}

async function fetchReviews(
  jwt: string,
  bundleId: string,
  limit: string,
): Promise<
  Array<{
    id: string;
    rating: number;
    title: string;
    body: string;
    reviewer: string;
    createdDate: string;
  }>
> {
  const appId = await resolveAppId(jwt, bundleId);

  const url = `${ASC_BASE}/apps/${appId}/customerReviews?sort=-createdDate&limit=${encodeURIComponent(limit)}&fields[customerReviews]=rating,title,body,createdDate,reviewerNickname`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`App Store Connect reviews failed (${res.status}): ${text}`);
  }

  const body = await res.json();
  return (
    (body.data ?? []) as Array<{
      id: string;
      attributes: {
        rating: number;
        title: string;
        body: string;
        reviewerNickname: string;
        createdDate: string;
      };
    }>
  ).map((r) => ({
    id: r.id,
    rating: r.attributes.rating,
    title: r.attributes.title ?? "",
    body: r.attributes.body ?? "",
    reviewer: r.attributes.reviewerNickname ?? "Anonymous",
    createdDate: r.attributes.createdDate,
  }));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
