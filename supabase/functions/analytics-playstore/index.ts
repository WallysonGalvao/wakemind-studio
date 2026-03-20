// supabase/functions/analytics-playstore/index.ts
// Proxy for Google Play Developer API v3
// Decrypts project Service Account JSON from Supabase Vault

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAY_BASE = "https://androidpublisher.googleapis.com/androidpublisher/v3";
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

    const allowed = ["reviews", "ratings"];
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

    // Get vault secret id + metadata
    const { data: integration, error: intErr } = await serviceClient
      .from("project_integrations")
      .select("vault_secret_id, metadata")
      .eq("project_id", projectId)
      .eq("provider", "playstore")
      .single();

    if (intErr || !integration) {
      return jsonError("Google Play integration not configured", 404);
    }

    // Decrypt from Vault
    const { data: secretRow, error: vaultErr } = await serviceClient
      .rpc("vault_decrypt_secret", { secret_id: integration.vault_secret_id })
      .maybeSingle();

    if (vaultErr || !secretRow) {
      return jsonError("Could not decrypt Google Play credentials", 500);
    }
    const raw: string = (secretRow as { decrypted_secret: string }).decrypted_secret;

    // Service Account JSON stored directly in Vault
    let serviceAccount: { client_email: string; private_key: string };
    try {
      serviceAccount = JSON.parse(raw);
    } catch {
      return jsonError(
        "Invalid Google Play credentials — please reconnect in Settings",
        500,
      );
    }

    // ── Get Google access token ──────────────────────────────────────────
    const accessToken = await getGoogleAccessToken(
      serviceAccount.client_email,
      serviceAccount.private_key,
    );

    const packageName =
      (integration.metadata as Record<string, string>)?.packageName ?? "";

    if (!packageName) {
      return jsonError("Package name not configured in metadata", 400);
    }

    // ── Proxy to Google Play API ─────────────────────────────────────────
    let data: unknown;

    if (endpoint === "reviews") {
      const maxResults = params?.maxResults ?? "20";
      data = await fetchPlayReviews(accessToken, packageName, maxResults);
    } else if (endpoint === "ratings") {
      data = await fetchPlayReviews(accessToken, packageName, "200", true);
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

// ── Google Service Account JWT → Access Token ────────────────────────────────

async function getGoogleAccessToken(
  clientEmail: string,
  privateKeyPem: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const enc = new TextEncoder();
  const headerB64 = base64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64url(enc.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await importRSAPKCS8(privateKeyPem);
  const sig = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    enc.encode(signingInput),
  );

  const jwt = `${signingInput}.${base64url(new Uint8Array(sig))}`;

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`Google OAuth failed (${tokenRes.status}): ${text}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token as string;
}

async function importRSAPKCS8(pem: string): Promise<CryptoKey> {
  const pemBody = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\\n/g, "")
    .replace(/\s/g, "");

  const binary = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "pkcs8",
    binary,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function base64url(bytes: Uint8Array): string {
  const str = btoa(String.fromCharCode(...bytes));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ── Google Play endpoints ────────────────────────────────────────────────────

interface PlayReview {
  reviewId: string;
  authorName: string;
  comments: Array<{
    userComment?: {
      text: string;
      lastModified: { seconds: string };
      starRating: number;
      originalText?: string;
      reviewerLanguage?: string;
    };
  }>;
}

async function fetchPlayReviews(
  accessToken: string,
  packageName: string,
  maxResults: string,
  ratingsOnly = false,
): Promise<unknown> {
  const url = `${PLAY_BASE}/applications/${encodeURIComponent(packageName)}/reviews?maxResults=${encodeURIComponent(maxResults)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Play API failed (${res.status}): ${text}`);
  }

  const body = await res.json();
  const reviews = (body.reviews ?? []) as PlayReview[];

  if (ratingsOnly) {
    // Compute ratings distribution
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
      const comment = r.comments?.[0]?.userComment;
      if (comment) {
        const rating = comment.starRating;
        distribution[String(rating)] = (distribution[String(rating)] ?? 0) + 1;
        sum += rating;
        total++;
      }
    }
    return {
      average: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
      total,
      distribution,
    };
  }

  // Return normalized reviews
  return reviews
    .map((r) => {
      const comment = r.comments?.[0]?.userComment;
      if (!comment) return null;
      return {
        id: r.reviewId,
        rating: comment.starRating,
        title: "",
        body: comment.text ?? "",
        reviewer: r.authorName ?? "Anonymous",
        createdDate: comment.lastModified?.seconds
          ? new Date(Number(comment.lastModified.seconds) * 1000).toISOString()
          : "",
        language: comment.reviewerLanguage ?? "",
      };
    })
    .filter(Boolean);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
