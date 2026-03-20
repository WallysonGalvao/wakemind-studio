// supabase/functions/save-integration/index.ts
// Saves an analytics API key to Supabase Vault and stores reference in project_integrations

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const { projectId, provider, token, metadata } = (await req.json()) as {
      projectId: string;
      provider: "mixpanel" | "revenuecat";
      token: string;
      metadata?: Record<string, string>;
    };

    if (!projectId || !provider || !token) {
      return jsonError("Missing projectId, provider, or token", 400);
    }

    if (!["mixpanel", "revenuecat"].includes(provider)) {
      return jsonError("Invalid provider", 400);
    }

    // ── Service client for Vault operations ──────────────────────────────
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

    // ── Check for existing integration ───────────────────────────────────
    const { data: existing } = await serviceClient
      .from("project_integrations")
      .select("id, vault_secret_id")
      .eq("project_id", projectId)
      .eq("provider", provider)
      .maybeSingle();

    // If existing, delete old secret from Vault
    if (existing) {
      await serviceClient.rpc("vault_delete_secret", {
        secret_id: existing.vault_secret_id,
      });
      await serviceClient.from("project_integrations").delete().eq("id", existing.id);
    }

    // ── Store in Vault ───────────────────────────────────────────────────
    const secretName = `${provider}_${projectId}`;
    const { data: vaultSecretId, error: vaultErr } = await serviceClient.rpc(
      "vault_create_secret",
      { new_secret: token, new_name: secretName },
    );

    if (vaultErr) return jsonError(`Vault error: ${vaultErr.message}`, 500);

    await insertIntegration(
      serviceClient,
      projectId,
      provider,
      vaultSecretId,
      metadata ?? {},
    );

    return jsonOk({ success: true, provider });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonError(message, 500);
  }
});

async function insertIntegration(
  client: ReturnType<typeof createClient>,
  projectId: string,
  provider: string,
  vaultSecretId: string,
  metadata: Record<string, string>,
) {
  const { error } = await client.from("project_integrations").insert({
    project_id: projectId,
    provider,
    vault_secret_id: vaultSecretId,
    metadata,
  });
  if (error) throw new Error(`Failed to save integration: ${error.message}`);
}

function jsonOk(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });
}
