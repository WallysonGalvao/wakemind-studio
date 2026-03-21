import * as React from "react";

import type { Project } from "@/types/project";

interface ProjectContextValue {
  project: Project;
}

const ProjectContext = React.createContext<ProjectContextValue | null>(null);

export function ProjectProvider({
  project,
  children,
}: {
  project: Project;
  children: React.ReactNode;
}) {
  const value = React.useMemo(() => ({ project }), [project]);
  return <ProjectContext value={value}>{children}</ProjectContext>;
}

export function useProject(): Project {
  const ctx = React.use(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within a ProjectProvider");
  return ctx.project;
}
