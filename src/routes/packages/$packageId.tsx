import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Download,
  ImageIcon,
  Loader2,
  Trash2,
  Wand2,
} from "lucide-react";
import * as React from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Label } from "#/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "#/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { BUILT_IN_PACKAGES, getPackageById } from "#/constants/packages";
import { useSettings } from "#/hooks/use-settings";
import { buildPrompt, type StyleConfig } from "#/lib/library/image/styles";
import { cn } from "#/lib/utils";
import { generateImage, type GenerateImageOptions } from "#/services/openai/image";
import { deleteAsset, getAllAssets, saveAsset } from "#/services/storage/assets";
import { getAllCustomPackages } from "#/services/storage/packages";
import type { AchievementPackage, AchievementPackageItem } from "#/types/achievements";
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
  const { settings } = useSettings();
  const [selectedAsset, setSelectedAsset] = React.useState<GeneratedAsset | null>(null);
  const [selectedAchievement, setSelectedAchievement] =
    React.useState<AchievementPackageItem | null>(null);

  // ── Generation state ──
  const [description, setDescription] = React.useState("");
  const [styleJson, setStyleJson] = React.useState(() =>
    JSON.stringify(pkg.styleConfig, null, 2),
  );
  const [styleError, setStyleError] = React.useState("");
  const [model, setModel] = React.useState("gpt-image-1");
  const [size, setSize] = React.useState("1024x1024");
  const [quality, setQuality] = React.useState<"standard" | "hd">("standard");
  const [format, setFormat] = React.useState("png");
  const [background, setBackground] = React.useState("transparent");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<{
    b64: string;
    format: string;
    prompt: string;
    name: string;
  } | null>(null);

  // Track which achievements already have assets
  const assetsByAchievement = React.useMemo(() => {
    const map = new Set<string>();
    for (const a of pkgAssets) map.add(a.name);
    return map;
  }, [pkgAssets]);

  async function handleDelete(id: string) {
    await deleteAsset(id);
    await router.invalidate();
  }

  function parseStyleConfig(): StyleConfig | null {
    try {
      const parsed = JSON.parse(styleJson);
      setStyleError("");
      return parsed as StyleConfig;
    } catch {
      setStyleError("Invalid JSON in style config");
      return null;
    }
  }

  async function handleGenerate() {
    if (!settings.openaiApiKey) {
      setError("No OpenAI API key configured. Please add it in Settings.");
      return;
    }
    if (!selectedAchievement) {
      setError("Please select an achievement to generate an asset for.");
      return;
    }

    const styleConfig = parseStyleConfig();
    if (!styleConfig) return;

    const assetName = selectedAchievement.id;
    const prompt = buildPrompt(styleConfig, assetName, description.trim() || undefined);

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const options: GenerateImageOptions = {
        model,
        size,
        quality,
        format,
        background,
      };
      const { b64, format: fmt } = await generateImage(
        settings.openaiApiKey,
        prompt,
        options,
      );
      setResult({ b64, format: fmt, prompt, name: assetName });

      const asset: GeneratedAsset = {
        id: crypto.randomUUID(),
        name: assetName,
        type: "image",
        packageId: pkg.id,
        model,
        prompt,
        settings: { size, quality, format, background },
        imageData: b64,
        mimeType: `image/${fmt}`,
        createdAt: Date.now(),
      };
      await saveAsset(asset);
      await router.invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadResult() {
    if (!result) return;
    const mimeMap: Record<string, string> = {
      png: "image/png",
      webp: "image/webp",
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
    };
    const mime = mimeMap[result.format] ?? "image/png";
    const a = document.createElement("a");
    a.href = `data:${mime};base64,${result.b64}`;
    a.download = `${result.name.toLowerCase().replace(/\s+/g, "_")}.${result.format}`;
    a.click();
  }

  const hasAchievements = pkg.items.length > 0;
  const imageSrc = result ? `data:image/${result.format};base64,${result.b64}` : null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Back + header */}
      <div className="flex items-start gap-4 border-b p-4">
        <Button variant="ghost" size="icon" asChild className="mt-0.5 shrink-0">
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
              <h1 className="text-xl font-bold tracking-tight">{pkg.name}</h1>
              <p className="text-xs text-muted-foreground">{pkg.description}</p>
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

      {/* Resizable split layout */}
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
            </div>

            {/* ── Achievements sub-tab ── */}
            {hasAchievements && (
              <TabsContent
                value="achievements"
                className="m-0 min-h-0 flex-1 data-[state=inactive]:hidden"
              >
                <div className="h-full overflow-auto p-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {pkg.items.map((item) => {
                      const isSelected = selectedAchievement?.id === item.id;
                      const hasAsset = assetsByAchievement.has(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={cn(
                            "group relative rounded-xl border bg-card text-left shadow-xs transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                            isSelected && "border-primary shadow-md ring-2 ring-primary",
                          )}
                          onClick={() => {
                            setSelectedAchievement(item);
                            setResult(null);
                            setError("");
                          }}
                        >
                          {hasAsset && (
                            <div className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-green-500 text-white">
                              <Check className="size-3" />
                            </div>
                          )}
                          <div className="flex flex-col items-center justify-center gap-2 p-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/50 transition-colors group-hover:bg-primary/5">
                              {pkg.renderIcon?.(item.iconName, {
                                size: 24,
                                className:
                                  "text-foreground group-hover:text-primary transition-colors",
                              })}
                            </div>
                            <div className="space-y-1 text-center">
                              <p
                                className="w-full truncate text-[11px] leading-tight font-medium"
                                title={item.id}
                              >
                                {item.id}
                              </p>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "h-4 px-1 text-[9px] tracking-wider uppercase",
                                  TIER_COLORS[item.tier as AchievementTier],
                                )}
                              >
                                {item.tier}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            )}

            {/* ── Assets sub-tab ── */}
            <TabsContent
              value="assets"
              className="m-0 min-h-0 flex-1 data-[state=inactive]:hidden"
            >
              {pkgAssets.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
                  <p className="text-sm">No assets generated yet.</p>
                  <p className="text-xs">Select an achievement and click Generate.</p>
                </div>
              ) : (
                <div className="h-full overflow-auto p-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* ── Right panel: Generation config + Preview ── */}
        <ResizablePanel defaultSize={45} minSize={25}>
          <div className="flex h-full flex-col overflow-auto">
            {/* API key warning */}
            {!settings.openaiApiKey && (
              <div className="m-4 mb-0 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                No OpenAI API key set.{" "}
                <Link to="/settings" className="font-medium underline underline-offset-2">
                  Go to Settings
                </Link>{" "}
                to add one.
              </div>
            )}

            <div className="flex flex-col gap-4 p-4">
              {/* Selected achievement + Preview */}
              {selectedAchievement ? (
                <Card>
                  <CardContent className="grid grid-cols-2 gap-4 p-4">
                    {/* Left: Generating for */}
                    <div className="flex flex-col gap-3">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <ImageIcon className="size-3.5" />
                        Generating for
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

                    {/* Right: Preview */}
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-muted-foreground">Preview</p>
                      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-muted/50">
                        {loading && (
                          <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        )}
                        {imageSrc && !loading && (
                          <img
                            src={imageSrc}
                            alt={result?.name}
                            className="max-h-full max-w-full rounded object-contain"
                          />
                        )}
                        {!imageSrc && !loading && (
                          <ImageIcon className="size-8 text-muted-foreground/30" />
                        )}
                      </div>
                      {result && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={handleDownloadResult}
                        >
                          <Download className="mr-1.5 size-3" />
                          Download .{result.format}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                  Select an achievement to generate an asset
                </div>
              )}

              {/* Description override */}
              {selectedAchievement && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="gen-desc">
                    Description{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional — overrides name in prompt)
                    </span>
                  </Label>
                  <textarea
                    id="gen-desc"
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                    placeholder="e.g. A golden ear of wheat, ripe and glowing"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              )}

              {/* Generation Options */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Generation Options</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Model</Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-image-1">gpt-image-1</SelectItem>
                        <SelectItem value="dall-e-3">dall-e-3</SelectItem>
                        <SelectItem value="dall-e-2">dall-e-2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024x1024">1024×1024</SelectItem>
                        <SelectItem value="1024x1536">1024×1536</SelectItem>
                        <SelectItem value="1536x1024">1536×1024</SelectItem>
                        <SelectItem value="512x512">512×512</SelectItem>
                        <SelectItem value="256x256">256×256</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Quality</Label>
                    <Select
                      value={quality}
                      onValueChange={(v) => setQuality(v as "standard" | "hd")}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="hd">HD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 flex flex-col gap-1">
                    <Label className="text-xs">Background</Label>
                    <Select value={background} onValueChange={setBackground}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transparent">Transparent</SelectItem>
                        <SelectItem value="opaque">Opaque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Style Config */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Style Config</CardTitle>
                  <CardDescription className="text-xs">
                    Pre-filled from the package. Edit freely to override.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    rows={10}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                    value={styleJson}
                    onChange={(e) => {
                      setStyleJson(e.target.value);
                      setStyleError("");
                    }}
                    spellCheck={false}
                  />
                  {styleError && (
                    <p className="mt-1 text-xs text-destructive">{styleError}</p>
                  )}
                </CardContent>
              </Card>

              {/* Error message */}
              {error && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive dark:border-red-900 dark:bg-red-950/30">
                  {error}
                </p>
              )}

              {/* Generate button */}
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={loading || !selectedAchievement}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 size-4" />
                    Generate Image
                  </>
                )}
              </Button>

              {/* Generated Prompt */}
              {result && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs">Generated Prompt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs leading-relaxed wrap-break-word text-muted-foreground">
                      {result.prompt}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

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
