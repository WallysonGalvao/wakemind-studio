import { invokeFunction } from "@/lib/supabase-helpers";

import type { StoreRatings, StoreReview } from "./appstore";

export function fetchPlayStoreRatings(projectId: string): Promise<StoreRatings> {
  return invokeFunction("analytics-playstore", {
    projectId,
    endpoint: "ratings",
  });
}

export function fetchPlayStoreReviews(
  projectId: string,
  limit = 20,
): Promise<StoreReview[]> {
  return invokeFunction("analytics-playstore", {
    projectId,
    endpoint: "reviews",
    params: { maxResults: String(limit) },
  });
}
