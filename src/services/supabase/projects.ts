import { supabase } from "@/lib/supabase";
import type { Project, ProjectRepository } from "@/types/project";
import type { Json } from "@/types/supabase";

export async function createProject(name: string, slug: string): Promise<Project> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("projects")
    .insert({ name, slug, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Project;
}

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as Project | null;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function updateProjectRepositories(
  id: string,
  repositories: ProjectRepository[],
): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update({ repositories: repositories as unknown as Json })
    .eq("id", id);
  if (error) throw error;
}
