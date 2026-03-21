import * as React from "react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GenerationOptions } from "@/types/generation";

interface GenerationOptionsCardProps {
  options: GenerationOptions;
  onOptionChange: <K extends keyof GenerationOptions>(
    key: K,
    value: GenerationOptions[K],
  ) => void;
}

export function GenerationOptionsCard({
  options,
  onOptionChange,
}: GenerationOptionsCardProps) {
  const { t } = useTranslation();
  const handleModelChange = React.useCallback(
    (v: string) => onOptionChange("model", v),
    [onOptionChange],
  );

  const handleSizeChange = React.useCallback(
    (v: string) => onOptionChange("size", v),
    [onOptionChange],
  );

  const handleQualityChange = React.useCallback(
    (v: string) => onOptionChange("quality", v as "standard" | "hd"),
    [onOptionChange],
  );

  const handleFormatChange = React.useCallback(
    (v: string) => onOptionChange("format", v),
    [onOptionChange],
  );

  const handleBackgroundChange = React.useCallback(
    (v: string) => onOptionChange("background", v),
    [onOptionChange],
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          {t("components.generationOptions.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-xs">{t("components.generationOptions.model")}</Label>
          <Select value={options.model} onValueChange={handleModelChange}>
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
          <Label className="text-xs">{t("components.generationOptions.size")}</Label>
          <Select value={options.size} onValueChange={handleSizeChange}>
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
          <Label className="text-xs">{t("components.generationOptions.quality")}</Label>
          <Select value={options.quality} onValueChange={handleQualityChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">
                {t("components.generationOptions.qualityStandard")}
              </SelectItem>
              <SelectItem value="hd">
                {t("components.generationOptions.qualityHd")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-xs">{t("components.generationOptions.format")}</Label>
          <Select value={options.format} onValueChange={handleFormatChange}>
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
          <Label className="text-xs">
            {t("components.generationOptions.background")}
          </Label>
          <Select value={options.background} onValueChange={handleBackgroundChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transparent">
                {t("components.generationOptions.bgTransparent")}
              </SelectItem>
              <SelectItem value="opaque">
                {t("components.generationOptions.bgOpaque")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
