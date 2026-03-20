import { supabase } from "@/lib/supabase";

export type IntegrationProvider = "mixpanel" | "revenuecat" | "appstore" | "playstore";

export async function saveIntegration(
  projectId: string,
  provider: IntegrationProvider,
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

export interface IntegrationStatusMap {
  mixpanel: IntegrationInfo;
  revenuecat: IntegrationInfo;
  appstore: IntegrationInfo;
  playstore: IntegrationInfo;
}

export async function getIntegrationStatus(
  projectId: string,
): Promise<IntegrationStatusMap> {
  const { data, error } = await supabase
    .from("project_integrations")
    .select("provider, metadata")
    .eq("project_id", projectId);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as Array<{
    provider: string;
    metadata: Record<string, string> | null;
  }>;

  function info(provider: string): IntegrationInfo {
    const row = rows.find((d) => d.provider === provider);
    return {
      connected: !!row,
      metadata: (row?.metadata as Record<string, string>) ?? {},
    };
  }

  return {
    mixpanel: info("mixpanel"),
    revenuecat: info("revenuecat"),
    appstore: info("appstore"),
    playstore: info("playstore"),
  };
}
