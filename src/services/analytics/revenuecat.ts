import { supabase } from "@/lib/supabase";

export interface RevenueCatOverview {
  active_subscribers: number;
  mrr: number;
  revenue: number;
  churn_rate: number;
}

export async function fetchOverview(
  projectId: string,
  rcProjectId: string,
): Promise<RevenueCatOverview> {
  const { data, error } = await supabase.functions.invoke("analytics-revenuecat", {
    body: { projectId, rcProjectId, endpoint: "metrics/overview" },
  });

  if (error) throw new Error(error.message);
  return data as RevenueCatOverview;
}
