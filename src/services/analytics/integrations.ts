import { supabase } from "@/lib/supabase";

export async function saveIntegration(
  projectId: string,
  provider: "mixpanel" | "revenuecat",
  token: string,
  metadata?: Record<string, string>,
): Promise<void> {
  const { error } = await supabase.functions.invoke("save-integration", {
    body: { projectId, provider, token, metadata },
  });

  if (error) throw new Error(error.message);
}

export interface IntegrationInfo {
  connected: boolean;
  metadata: Record<string, string>;
}

export async function getIntegrationStatus(
  projectId: string,
): Promise<{ mixpanel: IntegrationInfo; revenuecat: IntegrationInfo }> {
  const { data, error } = await supabase
    .from("project_integrations")
    .select("provider, metadata")
    .eq("project_id", projectId);

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const mp = rows.find((d) => d.provider === "mixpanel");
  const rc = rows.find((d) => d.provider === "revenuecat");

  return {
    mixpanel: {
      connected: !!mp,
      metadata: (mp?.metadata as Record<string, string>) ?? {},
    },
    revenuecat: {
      connected: !!rc,
      metadata: (rc?.metadata as Record<string, string>) ?? {},
    },
  };
}
