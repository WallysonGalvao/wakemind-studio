import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Folders, Plus, Settings, Trash2 } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryClient } from "@/configs/react-query";
import {
  createProject,
  deleteProject,
  getAllProjects,
} from "@/services/supabase/projects";
import type { Project } from "@/types/project";

export const Route = createFileRoute("/")({
  loader: async () => {
    const projects = await getAllProjects();
    return { projects };
  },
  component: HubOverview,
});

function HubOverview() {
  const { projects } = Route.useLoaderData();
  const router = useRouter();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newSlug, setNewSlug] = React.useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      createProject(
        newName.trim(),
        newSlug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-"),
      ),
    onSuccess: () => {
      setNewName("");
      setNewSlug("");
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.invalidate();
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) return;
    createMutation.mutate();
  }

  function handleOpenCreate() {
    setCreateOpen(true);
  }

  function handleNavigateProject(slug: string) {
    navigate({
      to: "/$projectSlug/dashboard",
      params: { projectSlug: slug },
    });
  }

  function handleDeleteProject(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate(id);
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNewName(e.target.value);
    setNewSlug(
      e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-"),
    );
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNewSlug(e.target.value);
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your apps and projects.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="size-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <Folders className="size-12 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium">No projects yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first project to get started.
          </p>
          <Button className="mt-6" onClick={handleOpenCreate}>
            <Plus className="size-4" />
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: Project) => (
            <Card
              key={project.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => handleNavigateProject(project.slug)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <Badge variant="secondary" className="text-[10px]">
                    {project.slug}
                  </Badge>
                </div>
                <CardDescription>
                  Created{" "}
                  {new Date(project.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate({
                      to: "/$projectSlug/settings",
                      params: { projectSlug: project.slug },
                    });
                  }}
                >
                  <Settings className="size-3" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                  onClick={(e) => handleDeleteProject(e, project.id)}
                >
                  <Trash2 className="size-3" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Projects let you organize assets and analytics for each of your apps.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proj-name">Name *</Label>
              <Input
                id="proj-name"
                placeholder="e.g. WakeMind, My App"
                value={newName}
                onChange={handleNameChange}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proj-slug">Slug *</Label>
              <Input
                id="proj-slug"
                placeholder="e.g. wakemind"
                value={newSlug}
                onChange={handleSlugChange}
              />
              <p className="text-xs text-muted-foreground">
                Used in the URL: /{newSlug || "my-project"}/dashboard
              </p>
            </div>
            <Button
              type="submit"
              disabled={createMutation.isPending || !newName.trim() || !newSlug.trim()}
            >
              {createMutation.isPending ? "Creating…" : "Create Project"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
