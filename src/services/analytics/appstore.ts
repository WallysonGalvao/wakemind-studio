import { invokeFunction } from "@/lib/supabase-helpers";

export interface StoreRatings {
  average: number;
  total: number;
  distribution: Record<string, number>;
}

export interface StoreReview {
  id: string;
  rating: number;
  title: string;
  body: string;
  reviewer: string;
  createdDate: string;
}

export function fetchAppStoreRatings(projectId: string): Promise<StoreRatings> {
  return invokeFunction("analytics-appstore", {
    projectId,
    endpoint: "ratings",
  });
}

export function fetchAppStoreReviews(
  projectId: string,
  limit = 20,
): Promise<StoreReview[]> {
  return invokeFunction("analytics-appstore", {
    projectId,
    endpoint: "reviews",
    params: { limit: String(limit) },
  });
}
