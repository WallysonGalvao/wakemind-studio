import { supabase } from "@/lib/supabase";

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

export async function fetchAppStoreRatings(projectId: string): Promise<StoreRatings> {
  const { data, error } = await supabase.functions.invoke("analytics-appstore", {
    body: { projectId, endpoint: "ratings" },
  });

  if (error) throw new Error(error.message);
  return data as StoreRatings;
}

export async function fetchAppStoreReviews(
  projectId: string,
  limit = 20,
): Promise<StoreReview[]> {
  const { data, error } = await supabase.functions.invoke("analytics-appstore", {
    body: { projectId, endpoint: "reviews", params: { limit: String(limit) } },
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as StoreReview[];
}
