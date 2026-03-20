import { invokeFunction } from "@/lib/supabase-helpers";

export interface MixpanelActiveUsers {
  dau: number;
  wau: number;
  mau: number;
}

export interface MixpanelTopEvent {
  event: string;
  count: number;
}

export interface MixpanelRetentionCohort {
  date: string;
  size: number;
  retention: number[];
}

export function fetchActiveUsers(projectId: string): Promise<MixpanelActiveUsers> {
  return invokeFunction("analytics-mixpanel", {
    projectId,
    endpoint: "engage",
    params: {},
  });
}

export function fetchTopEvents(
  projectId: string,
  limit = 10,
): Promise<MixpanelTopEvent[]> {
  return invokeFunction("analytics-mixpanel", {
    projectId,
    endpoint: "events/top",
    params: { limit: String(limit) },
  });
}

export function fetchRetention(
  projectId: string,
  fromDate: string,
  toDate: string,
): Promise<MixpanelRetentionCohort[]> {
  return invokeFunction("analytics-mixpanel", {
    projectId,
    endpoint: "retention",
    params: { from_date: fromDate, to_date: toDate },
  });
}
