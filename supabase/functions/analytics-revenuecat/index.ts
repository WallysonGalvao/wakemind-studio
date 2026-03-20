// supabase/functions/analytics-revenuecat/index.ts
// Proxy for RevenueCat REST API v2
// Decrypts project API key from Supabase Vault

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REVENUECAT_BASE = "https://api.revenuecat.com";
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
    const { projectId, endpoint } = (await req.json()) as {
      projectId: string;
      endpoint: string;
    };

    if (!projectId || !endpoint) {
      return jsonError("Missing projectId or endpoint", 400);
    }

    // Allowed endpoints whitelist
    const allowed = ["metrics/overview"];
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
      .select("vault_secret_id")
      .eq("project_id", projectId)
      .eq("provider", "revenuecat")
      .single();

    if (intErr || !integration) {
      return jsonError("RevenueCat integration not configured", 404);
    }

    // Decrypt from Vault
    const { data: secretRow, error: vaultErr } = await serviceClient
      .rpc("vault_decrypt_secret", { secret_id: integration.vault_secret_id })
      .maybeSingle();

    if (vaultErr || !secretRow) {
      return jsonError("Could not decrypt RevenueCat key", 500);
    }
    const raw: string = (secretRow as { decrypted_secret: string }).decrypted_secret;

    // Credentials stored as JSON: { apiKey, rcProjectId }
    let creds: { apiKey: string; rcProjectId: string };
    try {
      creds = JSON.parse(raw);
    } catch {
      return jsonError(
        "Invalid RevenueCat credentials format \u2014 please reconnect in Settings",
        500,
      );
    }

    // ── Proxy to RevenueCat ────────────────────────────────────────────
    const url = `${REVENUECAT_BASE}/v2/projects/${encodeURIComponent(creds.rcProjectId)}/${endpoint}`;

    const rcRes = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${creds.apiKey}`,
      },
    });

    const data = await rcRes.json();

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

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
