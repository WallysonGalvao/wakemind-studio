import { createFileRoute } from "@tanstack/react-router";
import { ImageIcon, Package } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

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
import { useProject } from "@/hooks/use-project";
import { downloadBase64 } from "@/lib/download";
import { getAllCustomPackages } from "@/services/supabase/packages";
import type { AchievementPackage } from "@/types/achievements";

export const Route = createFileRoute("/$projectSlug/generate/image")({
  loader: async ({ context }) => {
    const { project } = context as { project: { id: string } };
    const customPackages = await getAllCustomPackages(project.id);
    return { customPackages };
  },
  component: GenerateImagePage,
});

function GenerateImagePage() {
  const { t } = useTranslation();
  const { customPackages } = Route.useLoaderData();
  const project = useProject();
  const PACKAGES: AchievementPackage[] = [...BUILT_IN_PACKAGES, ...customPackages];
  const [packageId, setPackageId] = React.useState<string>("");
  const [name, setName] = React.useState("");

  const gen = useGeneration({ projectId: project.id });

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    gen.setDescription(e.target.value);
  }

  function handlePackageChange(id: string) {
    setPackageId(id);
    const pkg = PACKAGES.find((p) => p.id === id);
    if (pkg) gen.loadStyleConfig(pkg.styleConfig);
  }

  async function handleGenerate() {
    if (!packageId) return;
    if (!name.trim()) return;
    await gen.generate(name.trim(), packageId);
  }

  function handleDownload() {
    if (!gen.result) return;
    downloadBase64(gen.result.b64, gen.result.format, gen.result.name);
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("pages.generateImage.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("pages.generateImage.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* ── Left column: form ── */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="size-4" />
                {t("pages.generateImage.asset")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="package">{t("pages.generateImage.packageLabel")}</Label>
                <Select value={packageId} onValueChange={handlePackageChange}>
                  <SelectTrigger id="package">
                    <Package className="size-4 text-muted-foreground" />
                    <SelectValue
                      placeholder={t("pages.generateImage.packagePlaceholder")}
                    />
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
                <Label htmlFor="name">{t("pages.generateImage.nameLabel")}</Label>
                <Input
                  id="name"
                  placeholder={t("pages.generateImage.namePlaceholder")}
                  value={name}
                  onChange={handleNameChange}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">
                  {t("pages.generateImage.descriptionLabel")}{" "}
                  <span className="font-normal text-muted-foreground">
                    {t("pages.generateImage.descriptionHint")}
                  </span>
                </Label>
                <textarea
                  id="description"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={t("pages.generateImage.descriptionPlaceholder")}
                  value={gen.description}
                  onChange={handleDescriptionChange}
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
        </div>
      </div>
    </div>
  );
}
