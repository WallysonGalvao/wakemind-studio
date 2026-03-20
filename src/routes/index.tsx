import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Folders, Plus, Settings, Trash2 } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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
import { RouteErrorFallback } from "@/components/ui/route-error-fallback";
import { Skeleton } from "@/components/ui/skeleton";
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
  errorComponent: RouteErrorFallback,
  pendingComponent: ProjectsSkeleton,
});

function ProjectsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function HubOverview() {
  const { t } = useTranslation();
  const { projects } = Route.useLoaderData();
  const router = useRouter();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newSlug, setNewSlug] = React.useState("");

  const createMutation = useMutation({
    mutationFn: () => {
      const name = newName.trim();
      const slug = newSlug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-");
      return createProject(name, slug);
    },
    onMutate: async () => {
      setCreateOpen(false);
      const name = newName.trim();
      const slug = newSlug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-");
      setNewName("");
      setNewSlug("");
      return { name, slug };
    },
    onSuccess: () => {
      toast.success(t("toast.projectCreated"));
    },
    onError: (_err, _vars, context) => {
      if (context) {
        setNewName(context.name);
        setNewSlug(context.slug);
        setCreateOpen(true);
      }
      toast.error(t("toast.projectCreateFailed"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      toast.success(t("toast.projectDeleted"));
    },
    onError: () => {
      toast.error(t("toast.projectDeleteFailed"));
    },
    onSettled: () => {
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
          <h1 className="text-2xl font-bold tracking-tight">
            {t("pages.projects.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("pages.projects.subtitle")}
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="size-4" />
          {t("pages.projects.newProject")}
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <Folders className="size-12 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium">{t("pages.projects.emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("pages.projects.emptyDescription")}
          </p>
          <Button className="mt-6" onClick={handleOpenCreate}>
            <Plus className="size-4" />
            {t("pages.projects.createProject")}
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
                  {t("pages.projects.created")}{" "}
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
                  {t("pages.projects.settingsBtn")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                  onClick={(e) => handleDeleteProject(e, project.id)}
                >
                  <Trash2 className="size-3" />
                  {t("pages.projects.deleteBtn")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("pages.projects.createDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("pages.projects.createDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proj-name">
                {t("pages.projects.createDialog.nameLabel")}
              </Label>
              <Input
                id="proj-name"
                placeholder={t("pages.projects.createDialog.namePlaceholder")}
                value={newName}
                onChange={handleNameChange}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proj-slug">
                {t("pages.projects.createDialog.slugLabel")}
              </Label>
              <Input
                id="proj-slug"
                placeholder={t("pages.projects.createDialog.slugPlaceholder")}
                value={newSlug}
                onChange={handleSlugChange}
              />
              <p className="text-xs text-muted-foreground">
                {t("pages.projects.createDialog.slugHelper", {
                  slug: newSlug || "my-project",
                })}
              </p>
            </div>
            <Button
              type="submit"
              disabled={createMutation.isPending || !newName.trim() || !newSlug.trim()}
            >
              {createMutation.isPending
                ? t("pages.projects.createDialog.creating")
                : t("pages.projects.createDialog.createBtn")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
