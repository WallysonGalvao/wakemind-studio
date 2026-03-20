import { supabase } from "@/lib/supabase";

export interface RevenueCatOverview {
  active_subscribers: number;
  mrr: number;
  revenue: number;
  churn_rate: number;
  active_trials: number;
  new_customers: number;
  active_users: number;
}

interface RCMetric {
  id: string;
  value: number;
}

interface RCOverviewResponse {
  metrics: RCMetric[];
}

export async function fetchOverview(projectId: string): Promise<RevenueCatOverview> {
  const { data, error } = await supabase.functions.invoke("analytics-revenuecat", {
    body: { projectId, endpoint: "metrics/overview" },
  });

  if (error) throw new Error(error.message);

  const raw = data as RCOverviewResponse;
  const byId = new Map(raw.metrics.map((m) => [m.id, m.value]));

  return {
    active_subscribers: byId.get("active_subscriptions") ?? 0,
    mrr: byId.get("mrr") ?? 0,
    revenue: byId.get("revenue") ?? 0,
    churn_rate: 0, // not provided by overview endpoint
    active_trials: byId.get("active_trials") ?? 0,
    new_customers: byId.get("new_customers") ?? 0,
    active_users: byId.get("active_users") ?? 0,
  };
}
