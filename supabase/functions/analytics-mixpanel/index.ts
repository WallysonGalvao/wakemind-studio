// supabase/functions/analytics-mixpanel/index.ts
// Proxy for Mixpanel Data Export / Insights API
// Decrypts project token from Supabase Vault

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MIXPANEL_BASE = "https://data.mixpanel.com/api/2.0";
const CACHE_TTL = 300; // 5 minutes

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonError("Missing Authorization header", 401);
    }

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
      endpoint: string; // e.g. "engage", "events/top", "retention", "funnels"
      params?: Record<string, string>;
    };

    if (!projectId || !endpoint) {
      return jsonError("Missing projectId or endpoint", 400);
    }

    // Allowed endpoints whitelist
    const allowed = ["engage", "events/top", "retention", "funnels", "events"];
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
      .eq("provider", "mixpanel")
      .single();

    if (intErr || !integration) {
      return jsonError("Mixpanel integration not configured", 404);
    }

    // Decrypt from Vault
    const { data: secrets, error: vaultErr } = (await serviceClient
      .rpc("vault_decrypt_secret", { secret_id: integration.vault_secret_id })
      .maybeSingle()) as { data: { decrypted_secret: string } | null; error: unknown };

    // Fallback: direct query to decrypted_secrets view
    let apiSecret: string;
    if (vaultErr || !secrets) {
      const { data: vaultRow } = await serviceClient
        .from("vault.decrypted_secrets" as never)
        .select("decrypted_secret")
        .eq("id", integration.vault_secret_id)
        .single();
      if (!vaultRow) return jsonError("Could not decrypt Mixpanel token", 500);
      apiSecret = (vaultRow as { decrypted_secret: string }).decrypted_secret;
    } else {
      apiSecret = secrets.decrypted_secret;
    }

    // ── Proxy to Mixpanel ────────────────────────────────────────────────
    const url = new URL(`${MIXPANEL_BASE}/${endpoint}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }
    }

    const mixpanelRes = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${btoa(apiSecret + ":")}`,
      },
    });

    const data = await mixpanelRes.json();

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
