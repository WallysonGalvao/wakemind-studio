import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import * as React from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardHeader } from "#/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { BUILT_IN_PACKAGES, getPackageById } from "#/constants/packages";
import { cn } from "#/lib/utils";
import { deleteAsset, getAllAssets } from "#/services/storage/assets";
import { getAllCustomPackages } from "#/services/storage/packages";
import type { AchievementPackage } from "#/types/achievements";
import { AchievementTier } from "#/types/achievements";
import type { GeneratedAsset } from "#/types/asset";

export const Route = createFileRoute("/packages/$packageId")({
  loader: async ({ params }) => {
    const [assets, customPackages] = await Promise.all([
      getAllAssets(),
      getAllCustomPackages(),
    ]);
    const allPackages = [...BUILT_IN_PACKAGES, ...customPackages];
    const pkg = getPackageById(params.packageId, allPackages);
    if (!pkg) throw new Error(`Package "${params.packageId}" not found`);
    const pkgAssets = assets.filter((a) => a.packageId === pkg.id);
    return { pkg, pkgAssets, allPackages };
  },
  component: PackageDetailPage,
});

const TIER_COLORS = {
  [AchievementTier.BRONZE]:
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900/50",
  [AchievementTier.SILVER]:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-800",
  [AchievementTier.GOLD]:
    "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50",
  [AchievementTier.PLATINUM]:
    "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-900/50",
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AssetDetailSheet({
  asset,
  open,
  onClose,
  onDelete,
  allPackages,
}: {
  asset: GeneratedAsset | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  allPackages: AchievementPackage[];
}) {
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    if (!asset) return;
    setDeleting(true);
    await onDelete(asset.id);
    setDeleting(false);
    onClose();
  }

  function handleDownload() {
    if (!asset) return;
    const a = document.createElement("a");
    a.href = `data:${asset.mimeType};base64,${asset.imageData}`;
    const ext = asset.mimeType.split("/")[1] ?? "png";
    a.download = `${asset.name.toLowerCase().replace(/\s+/g, "_")}.${ext}`;
    a.click();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-y-auto p-0">
        {asset && (
          <>
            <DialogHeader className="border-b p-6 pb-4">
              <DialogTitle className="truncate">{asset.name}</DialogTitle>
              <DialogDescription>{formatDate(asset.createdAt)}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6 p-6">
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/50">
                <img
                  src={`data:${asset.mimeType};base64,${asset.imageData}`}
                  alt={asset.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium">
                  {allPackages.find((p) => p.id === asset.packageId)?.name ??
                    asset.packageId ??
                    "—"}
                </span>
                <span className="text-muted-foreground">Model</span>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {asset.model}
                </code>
                <span className="text-muted-foreground">Type</span>
                <span className="capitalize">{asset.type}</span>
                {Object.entries(asset.settings).map(([k, v]) => (
                  <React.Fragment key={k}>
                    <span className="text-muted-foreground capitalize">{k}</span>
                    <span>{String(v)}</span>
                  </React.Fragment>
                ))}
              </div>

              {asset.prompt && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Prompt
                  </p>
                  <p className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
                    {asset.prompt}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleDownload}>
                  <Download className="size-4" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleDelete}
                  disabled={deleting}
                  aria-label="Delete asset"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PackageDetailPage() {
  const { pkg, pkgAssets, allPackages } = Route.useLoaderData();
  const router = useRouter();
  const [selectedAsset, setSelectedAsset] = React.useState<GeneratedAsset | null>(null);

  async function handleDelete(id: string) {
    await deleteAsset(id);
    await router.invalidate();
  }

  const hasAchievements = pkg.items.length > 0;

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden p-6">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild className="mt-1 shrink-0">
          <Link to="/library">
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back to Library</span>
          </Link>
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: pkg.color }}
            >
              {pkg.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{pkg.name}</h1>
              <p className="text-sm text-muted-foreground">{pkg.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasAchievements && (
              <Badge variant="outline">{pkg.items.length} Achievements</Badge>
            )}
            <Badge variant="secondary">{pkgAssets.length} Assets</Badge>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <Tabs
        defaultValue={hasAchievements ? "achievements" : "assets"}
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <TabsList className="w-fit">
          {hasAchievements && (
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          )}
          <TabsTrigger value="assets">
            Assets
            {pkgAssets.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                {pkgAssets.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Achievements sub-tab ── */}
        {hasAchievements && (
          <TabsContent
            value="achievements"
            className="min-h-0 flex-1 data-[state=inactive]:hidden"
          >
            <div className="h-full overflow-auto rounded-md border border-border bg-card/50">
              <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                {pkg.items.map((item) => (
                  <Card key={item.id} className="group transition-shadow hover:shadow-md">
                    <CardHeader className="flex flex-col items-center justify-center gap-3 p-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted/50 transition-colors group-hover:bg-primary/5">
                        {pkg.renderIcon?.(item.iconName, {
                          size: 32,
                          className:
                            "text-foreground group-hover:text-primary transition-colors",
                        })}
                      </div>
                      <div className="space-y-1 text-center">
                        <p
                          className="w-full truncate text-xs leading-tight font-medium"
                          title={item.id}
                        >
                          {item.id}
                        </p>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "h-4 px-1 text-[10px] tracking-wider uppercase",
                            TIER_COLORS[item.tier as AchievementTier],
                          )}
                        >
                          {item.tier}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        )}

        {/* ── Assets sub-tab ── */}
        <TabsContent
          value="assets"
          className="min-h-0 flex-1 data-[state=inactive]:hidden"
        >
          {pkgAssets.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border text-muted-foreground">
              <p className="text-sm">No assets generated for this package yet.</p>
              <p className="text-xs">
                Go to Generate Image and select &quot;{pkg.name}&quot;.
              </p>
            </div>
          ) : (
            <div className="h-full overflow-auto rounded-md border border-border bg-card/50">
              <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {pkgAssets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="flex aspect-square w-full items-center justify-center bg-muted/50">
                      <img
                        src={`data:${asset.mimeType};base64,${asset.imageData}`}
                        alt={asset.name}
                        className="max-h-full max-w-full object-contain p-2"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 p-2 text-left">
                      <p className="truncate text-xs leading-tight font-medium">
                        {asset.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(asset.createdAt)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AssetDetailSheet
        asset={selectedAsset}
        open={selectedAsset !== null}
        onClose={() => setSelectedAsset(null)}
        onDelete={handleDelete}
        allPackages={allPackages}
      />
    </div>
  );
}
