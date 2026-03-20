import { supabase } from "@/lib/supabase";

export interface MixpanelActiveUsers {
  dau: number;
  wau: number;
  mau: number;
}

export interface MixpanelTopEvent {
  event: string;
  count: number;
}

export async function fetchActiveUsers(projectId: string): Promise<MixpanelActiveUsers> {
  const { data, error } = await supabase.functions.invoke("analytics-mixpanel", {
    body: { projectId, endpoint: "engage", params: {} },
  });

  if (error) throw new Error(error.message);
  return data as MixpanelActiveUsers;
}

export async function fetchTopEvents(
  projectId: string,
  limit = 10,
): Promise<MixpanelTopEvent[]> {
  const { data, error } = await supabase.functions.invoke("analytics-mixpanel", {
    body: {
      projectId,
      endpoint: "events/top",
      params: { limit: String(limit) },
    },
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as MixpanelTopEvent[];
}

export async function fetchRetention(
  projectId: string,
  fromDate: string,
  toDate: string,
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.functions.invoke("analytics-mixpanel", {
    body: {
      projectId,
      endpoint: "retention",
      params: { from_date: fromDate, to_date: toDate },
    },
  });

  if (error) throw new Error(error.message);
  return data as Record<string, unknown>;
}
