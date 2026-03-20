export interface Project {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectIntegration {
  id: string;
  project_id: string;
  provider: "mixpanel" | "revenuecat";
  vault_secret_id: string;
  created_at: string;
}
