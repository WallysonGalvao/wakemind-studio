import { supabase } from "@/lib/supabase";

import type { StoreRatings, StoreReview } from "./appstore";

export async function fetchPlayStoreRatings(projectId: string): Promise<StoreRatings> {
  const { data, error } = await supabase.functions.invoke("analytics-playstore", {
    body: { projectId, endpoint: "ratings" },
  });

  if (error) throw new Error(error.message);
  return data as StoreRatings;
}

export async function fetchPlayStoreReviews(
  projectId: string,
  limit = 20,
): Promise<StoreReview[]> {
  const { data, error } = await supabase.functions.invoke("analytics-playstore", {
    body: { projectId, endpoint: "reviews", params: { maxResults: String(limit) } },
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as StoreReview[];
}
