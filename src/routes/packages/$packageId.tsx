import { createFileRoute, redirect } from "@tanstack/react-router";

import { getAllProjects } from "@/services/supabase/projects";

export const Route = createFileRoute("/packages/$packageId")({
  beforeLoad: async ({ params }) => {
    const projects = await getAllProjects();
    if (projects.length > 0) {
      throw redirect({
        to: "/$projectSlug/packages/$packageId",
        params: { projectSlug: projects[0].slug, packageId: params.packageId },
      });
    }
    throw redirect({ to: "/" });
  },
});
