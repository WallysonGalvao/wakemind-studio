import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Download, ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import * as React from "react";

import { CreatePackageDialog } from "@/components/library/create-package-dialog";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BUILT_IN_PACKAGES } from "@/constants/packages";
import { useProject } from "@/hooks/use-project";
import { exportPackage } from "@/lib/download";
import { getAllAssets } from "@/services/supabase/assets";
import { deletePackage, getAllCustomPackages } from "@/services/supabase/packages";
import type { AchievementPackage } from "@/types/achievements";
import type { GeneratedAsset } from "@/types/asset";

export const Route = createFileRoute("/$projectSlug/library")({
  loader: async ({ context }) => {
    const { project } = context as { project: { id: string } };
    const [assets, customPackages] = await Promise.all([
      getAllAssets(project.id),
      getAllCustomPackages(project.id),
    ]);
    return { assets, customPackages };
  },
  component: LibraryPage,
});

type SortOption = "last-edited" | "name" | "assets";

function getLastEdited(pkg: AchievementPackage, assets: GeneratedAsset[]): number {
  if (!pkg.isBuiltIn && pkg.createdAt > 0) {
    const pkgAssets = assets.filter((a) => a.packageId === pkg.id);
    const latestAsset = pkgAssets.length > 0 ? pkgAssets[0]!.createdAt : 0;
    return Math.max(pkg.createdAt, latestAsset);
  }
  const pkgAssets = assets.filter((a) => a.packageId === pkg.id);
  return pkgAssets.length > 0 ? pkgAssets[0]!.createdAt : 0;
}

function formatRelativeDate(ts: number): string {
  if (ts === 0) return "";
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Edited just now";
  if (minutes < 60) return `Edited ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Edited ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Edited ${days}d ago`;
  return `Edited ${new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function LibraryPage() {
  const { assets, customPackages } = Route.useLoaderData();
  const project = useProject();
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<SortOption>("last-edited");
  const [createOpen, setCreateOpen] = React.useState(false);

  async function handleDeletePackage(id: string) {
    await deletePackage(id);
    await router.invalidate();
  }

  const allPackages = React.useMemo(
    () => [...BUILT_IN_PACKAGES, ...customPackages],
    [customPackages],
  );

  const filtered = React.useMemo(() => {
    let pkgs = allPackages;

    if (search.trim()) {
      const q = search.toLowerCase();
      pkgs = pkgs.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      );
    }

    pkgs.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "assets": {
          const countA = assets.filter((x) => x.packageId === a.id).length;
          const countB = assets.filter((x) => x.packageId === b.id).length;
          return countB - countA;
        }
        case "last-edited":
        default:
          return getLastEdited(b, assets) - getLastEdited(a, assets);
      }
    });

    return pkgs;
  }, [allPackages, search, sort, assets]);

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Library</h1>
        <p className="text-muted-foreground">
          Browse achievement icon packages and generated assets.
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search packages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-edited">Last edited</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="assets">Asset count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {/* Create new package card */}
        <button
          type="button"
          className="group flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card/50 p-6 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          style={{ minHeight: 220 }}
          onClick={() => setCreateOpen(true)}
        >
          <div className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 transition-colors group-hover:border-primary/50">
            <Plus className="size-6 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            Create new package
          </span>
        </button>

        {/* Package cards */}
        {filtered.map((pkg) => {
          const assetCount = assets.filter((a) => a.packageId === pkg.id).length;
          const lastEdited = getLastEdited(pkg, assets);

          const card = (
            <Link
              key={pkg.id}
              to="/$projectSlug/packages/$packageId"
              params={{ projectSlug: project.slug, packageId: pkg.id }}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {/* Color area */}
              <div
                className="relative flex aspect-4/3 items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${pkg.color}, ${pkg.color}cc)`,
                }}
              >
                <span className="text-4xl font-bold text-white/80 drop-shadow-sm select-none">
                  {pkg.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                {!pkg.isBuiltIn && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 bg-white/20 text-[10px] text-white backdrop-blur-sm"
                  >
                    Custom
                  </Badge>
                )}
              </div>

              {/* Info area */}
              <div className="flex flex-col gap-1 p-3">
                <div className="flex items-center gap-2">
                  <p className="flex-1 truncate text-sm font-semibold">{pkg.name}</p>
                  {assetCount > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                      {assetCount}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {lastEdited > 0 ? formatRelativeDate(lastEdited) : pkg.description}
                </p>
              </div>
            </Link>
          );

          if (pkg.isBuiltIn) {
            return <React.Fragment key={pkg.id}>{card}</React.Fragment>;
          }

          return (
            <ContextMenu key={pkg.id}>
              <ContextMenuTrigger asChild>{card}</ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem asChild>
                  <Link
                    to="/$projectSlug/packages/$packageId"
                    params={{ projectSlug: project.slug, packageId: pkg.id }}
                  >
                    <ExternalLink className="size-4" />
                    Open
                  </Link>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => exportPackage(pkg)}>
                  <Download className="size-4" />
                  Export JSON
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  variant="destructive"
                  onClick={() => handleDeletePackage(pkg.id)}
                >
                  <Trash2 className="size-4" />
                  Delete package
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>

      <CreatePackageDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => router.invalidate()}
        projectId={project.id}
      />
    </div>
  );
}
