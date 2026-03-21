import { supabase } from "@/lib/supabase";
import type { AchievementPackage } from "@/types/achievements";
import type { Json } from "@/types/supabase";

export async function savePackage(
  pkg: AchievementPackage,
  projectId: string,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("packages").insert({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    color: pkg.color,
    achievements: pkg.items as unknown as Json,
    style_config: pkg.styleConfig as unknown as Json,
    created_at: pkg.createdAt,
    user_id: user.id,
    project_id: projectId,
  });
  if (error) throw error;
}

export async function getAllCustomPackages(
  projectId: string,
): Promise<AchievementPackage[]> {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    color: row.color as string,
    isBuiltIn: false,
    createdAt: row.created_at as number,
    styleConfig: row.style_config as unknown as Record<string, unknown>,
    items: row.achievements as unknown as AchievementPackage["items"],
  }));
}

export async function deletePackage(id: string): Promise<void> {
  const { error } = await supabase.from("packages").delete().eq("id", id);
  if (error) throw error;
}
