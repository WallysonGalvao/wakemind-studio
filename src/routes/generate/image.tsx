import { createFileRoute } from "@tanstack/react-router";
import { ImageIcon, Package } from "lucide-react";
import * as React from "react";

import { GenerateButton } from "@/components/generation/generate-button";
import { GenerationOptionsCard } from "@/components/generation/generation-options";
import { GenerationPreview } from "@/components/generation/generation-preview";
import { StyleConfigEditor } from "@/components/generation/style-config-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BUILT_IN_PACKAGES } from "@/constants/packages";
import { useGeneration } from "@/hooks/use-generation";
import { downloadBase64 } from "@/lib/download";
import { getAllCustomPackages } from "@/services/supabase/packages";
import type { AchievementPackage } from "@/types/achievements";

export const Route = createFileRoute("/generate/image")({
  loader: async () => {
    const customPackages = await getAllCustomPackages();
    return { customPackages };
  },
  component: GenerateImagePage,
});

function GenerateImagePage() {
  const { customPackages } = Route.useLoaderData();
  const PACKAGES: AchievementPackage[] = [...BUILT_IN_PACKAGES, ...customPackages];
  const [packageId, setPackageId] = React.useState<string>("");
  const [name, setName] = React.useState("");

  const gen = useGeneration();

  function handlePackageChange(id: string) {
    setPackageId(id);
    const pkg = PACKAGES.find((p) => p.id === id);
    if (pkg) gen.loadStyleConfig(pkg.styleConfig);
  }

  async function handleGenerate() {
    if (!packageId) {
      return;
    }
    if (!name.trim()) {
      return;
    }
    await gen.generate(name.trim(), packageId);
  }

  function handleDownload() {
    if (!gen.result) return;
    downloadBase64(gen.result.b64, gen.result.format, gen.result.name);
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Generate Image</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate game assets using the OpenAI image generation API.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* ── Left column: form ── */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="size-4" />
                Asset
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="package">Package *</Label>
                <Select value={packageId} onValueChange={handlePackageChange}>
                  <SelectTrigger id="package">
                    <Package className="size-4 text-muted-foreground" />
                    <SelectValue placeholder="Select a package…" />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGES.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Wheat, Iron Sword, Fire Crystal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">
                  Description{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional — overrides name in prompt)
                  </span>
                </Label>
                <textarea
                  id="description"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g. A golden ear of wheat, ripe and glowing, with a few leaves at the base"
                  value={gen.description}
                  onChange={(e) => gen.setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <GenerationOptionsCard options={gen.options} onOptionChange={gen.setOption} />

          <StyleConfigEditor
            value={gen.styleJson}
            onChange={gen.setStyleJson}
            error={gen.styleError}
            rows={16}
          />

          {gen.error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive dark:border-red-900 dark:bg-red-950/30">
              {gen.error}
            </p>
          )}

          <GenerateButton
            loading={gen.loading}
            disabled={!packageId || !name.trim()}
            onClick={handleGenerate}
          />
        </div>

        {/* ── Right column: preview ── */}
        <div className="flex flex-col gap-4">
          <GenerationPreview
            result={gen.result}
            loading={gen.loading}
            onDownload={handleDownload}
          />

          {gen.result && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Generated Prompt</CardTitle>
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
    </div>
  );
}
