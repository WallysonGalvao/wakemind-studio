import { createFileRoute, redirect } from "@tanstack/react-router";

import { getAllProjects } from "@/services/supabase/projects";

export const Route = createFileRoute("/library")({
  beforeLoad: async () => {
    const projects = await getAllProjects();
    if (projects.length > 0) {
      throw redirect({
        to: "/$projectSlug/library",
        params: { projectSlug: projects[0].slug },
      });
    }
    throw redirect({ to: "/" });
  },
});
