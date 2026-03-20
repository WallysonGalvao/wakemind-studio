import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { ProjectProvider } from "@/hooks/use-project";
import { getProjectBySlug } from "@/services/supabase/projects";

export const Route = createFileRoute("/$projectSlug")({
  beforeLoad: async ({ params }) => {
    const project = await getProjectBySlug(params.projectSlug);
    if (!project) throw redirect({ to: "/" });
    return { project };
  },
  component: ProjectLayout,
});

function ProjectLayout() {
  const { project } = Route.useRouteContext();
  return (
    <ProjectProvider project={project}>
      <Outlet />
    </ProjectProvider>
  );
}
