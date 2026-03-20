import { supabase } from "@/lib/supabase";

export async function saveIntegration(
  projectId: string,
  provider: "mixpanel" | "revenuecat",
  token: string,
): Promise<void> {
  const { error } = await supabase.functions.invoke("save-integration", {
    body: { projectId, provider, token },
  });

  if (error) throw new Error(error.message);
}

export async function getIntegrationStatus(
  projectId: string,
): Promise<{ mixpanel: boolean; revenuecat: boolean }> {
  const { data, error } = await supabase
    .from("project_integrations")
    .select("provider")
    .eq("project_id", projectId);

  if (error) throw new Error(error.message);

  const providers = (data ?? []).map((d) => d.provider);
  return {
    mixpanel: providers.includes("mixpanel"),
    revenuecat: providers.includes("revenuecat"),
  };
}
