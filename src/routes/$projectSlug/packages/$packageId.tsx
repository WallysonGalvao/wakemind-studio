import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GenerateButton } from "@/components/generation/generate-button";
import { GenerationOptionsCard } from "@/components/generation/generation-options";
import { GenerationPreview } from "@/components/generation/generation-preview";
import { StyleConfigEditor } from "@/components/generation/style-config-editor";
import { AchievementGrid } from "@/components/packages/achievement-grid";
import { AssetDetailDialog } from "@/components/packages/asset-detail-dialog";
import { AssetGrid } from "@/components/packages/asset-grid";
import { PackageHeader } from "@/components/packages/package-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TIER_COLORS } from "@/constants/achievements";
import { BUILT_IN_PACKAGES, getPackageById } from "@/constants/packages";
import { useGeneration } from "@/hooks/use-generation";
import { useProject } from "@/hooks/use-project";
import { downloadAsset, downloadBase64, exportPackage } from "@/lib/download";
import { cn } from "@/lib/utils";
import { deleteAsset, getAllAssets } from "@/services/supabase/assets";
import { getAllCustomPackages } from "@/services/supabase/packages";
import type { AchievementPackageItem } from "@/types/achievements";
import { type AchievementTier } from "@/types/achievements";
import type { GeneratedAsset } from "@/types/asset";

export const Route = createFileRoute("/$projectSlug/packages/$packageId")({
  loader: async ({ params, context }) => {
    const { project } = context as { project: { id: string } };
    const [assets, customPackages] = await Promise.all([
      getAllAssets(project.id),
      getAllCustomPackages(project.id),
    ]);
    const allPackages = [...BUILT_IN_PACKAGES, ...customPackages];
    const pkg = getPackageById(params.packageId, allPackages);
    if (!pkg) throw new Error(`Package "${params.packageId}" not found`);
    const pkgAssets = assets.filter((a) => a.packageId === pkg.id);
    return { pkg, pkgAssets, allPackages };
  },
  component: PackageDetailPage,
});

function PackageDetailPage() {
  const { t } = useTranslation();
  const { pkg, pkgAssets, allPackages } = Route.useLoaderData();
  const project = useProject();
  const router = useRouter();
  const [selectedAsset, setSelectedAsset] = React.useState<GeneratedAsset | null>(null);
  const [selectedAchievement, setSelectedAchievement] =
    React.useState<AchievementPackageItem | null>(null);

  const gen = useGeneration({
    initialStyleConfig: pkg.styleConfig,
    projectId: project.id,
  });

  const assetsByAchievement = React.useMemo(() => {
    const set = new Set<string>();
    for (const a of pkgAssets) set.add(a.name);
    return set;
  }, [pkgAssets]);

  function findAsset(id: string) {
    return pkgAssets.find((a) => a.name === id);
  }

  async function handleDelete(id: string) {
    await deleteAsset(id);
    await router.invalidate();
  }

  function handleSelectAchievement(item: AchievementPackageItem) {
    setSelectedAchievement(item);
    gen.reset();
  }

  async function handleGenerate() {
    if (!selectedAchievement) return;
    const saved = await gen.generate(selectedAchievement.id, pkg.id);
    if (saved) await router.invalidate();
  }

  function handleDownloadResult() {
    if (!gen.result) return;
    downloadBase64(gen.result.b64, gen.result.format, gen.result.name);
  }

  const hasAchievements = pkg.items.length > 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PackageHeader
        pkg={pkg}
        achievementCount={pkg.items.length}
        assetCount={pkgAssets.length}
        onExport={() => exportPackage(pkg)}
      />

      <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
        {/* ── Left panel: Achievements / Assets ── */}
        <ResizablePanel defaultSize={55} minSize={30}>
          <Tabs
            defaultValue={hasAchievements ? "achievements" : "assets"}
            className="flex h-full flex-col"
          >
            <div className="border-b px-4 py-2">
              <TabsList className="w-fit">
                {hasAchievements && (
                  <TabsTrigger value="achievements">
                    {t("pages.packageDetail.achievements")}
                  </TabsTrigger>
                )}
                <TabsTrigger value="assets">
                  {t("pages.packageDetail.assets")}
                  {pkgAssets.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                      {pkgAssets.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {hasAchievements && (
              <TabsContent
                value="achievements"
                className="m-0 min-h-0 flex-1 data-[state=inactive]:hidden"
              >
                <AchievementGrid
                  items={pkg.items}
                  pkg={pkg}
                  assetsByAchievement={assetsByAchievement}
                  selectedId={selectedAchievement?.id ?? null}
                  onSelect={handleSelectAchievement}
                  onViewAsset={setSelectedAsset}
                  onDownloadAsset={downloadAsset}
                  findAsset={findAsset}
                />
              </TabsContent>
            )}

            <TabsContent
              value="assets"
              className="m-0 min-h-0 flex-1 data-[state=inactive]:hidden"
            >
              <AssetGrid
                assets={pkgAssets}
                onSelect={setSelectedAsset}
                onDelete={handleDelete}
                onDownload={downloadAsset}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* ── Right panel: Generation config + Preview ── */}
        <ResizablePanel defaultSize={45} minSize={25}>
          <div className="flex h-full flex-col overflow-auto">
            <div className="flex flex-col gap-4 p-4">
              {/* Selected achievement + Preview */}
              {selectedAchievement ? (
                <Card>
                  <CardContent className="grid grid-cols-2 gap-4 p-4">
                    <div className="flex flex-col gap-3">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <ImageIcon className="size-3.5" />
                        {t("pages.packageDetail.generatingFor")}
                      </p>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${pkg.color}15` }}
                        >
                          {pkg.renderIcon?.(selectedAchievement.iconName, {
                            size: 20,
                            className: "text-foreground",
                          })}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {selectedAchievement.id}
                          </p>
                          <div className="flex gap-1.5">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "h-4 px-1 text-[9px] tracking-wider uppercase",
                                TIER_COLORS[selectedAchievement.tier as AchievementTier],
                              )}
                            >
                              {selectedAchievement.tier}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="h-4 px-1 text-[9px] capitalize"
                            >
                              {selectedAchievement.category.toLowerCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <GenerationPreview
                      result={gen.result}
                      loading={gen.loading}
                      onDownload={handleDownloadResult}
                      compact
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                  {t("pages.packageDetail.selectAchievement")}
                </div>
              )}

              {selectedAchievement && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="gen-desc">
                    {t("pages.packageDetail.descriptionLabel")}{" "}
                    <span className="font-normal text-muted-foreground">
                      {t("pages.packageDetail.descriptionHint")}
                    </span>
                  </Label>
                  <textarea
                    id="gen-desc"
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                    placeholder={t("pages.packageDetail.descriptionPlaceholder")}
                    value={gen.description}
                    onChange={(e) => gen.setDescription(e.target.value)}
                  />
                </div>
              )}

              <GenerationOptionsCard
                options={gen.options}
                onOptionChange={gen.setOption}
              />

              <StyleConfigEditor
                value={gen.styleJson}
                onChange={gen.setStyleJson}
                error={gen.styleError}
              />

              {gen.error && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive dark:border-red-900 dark:bg-red-950/30">
                  {gen.error}
                </p>
              )}

              <GenerateButton
                loading={gen.loading}
                disabled={!selectedAchievement}
                onClick={handleGenerate}
              />

              {gen.result && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs">
                      {t("pages.packageDetail.generatedPrompt")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs leading-relaxed wrap-break-word text-muted-foreground">
                      {gen.result.prompt}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <AssetDetailDialog
        asset={selectedAsset}
        open={selectedAsset !== null}
        onClose={() => setSelectedAsset(null)}
        onDelete={handleDelete}
        allPackages={allPackages}
      />
    </div>
  );
}
