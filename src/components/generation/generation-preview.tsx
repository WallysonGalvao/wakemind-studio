import { Download, ImageIcon, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GenerationResult } from "@/types/generation";

interface GenerationPreviewProps {
  result: GenerationResult | null;
  loading: boolean;
  onDownload: () => void;
  compact?: boolean;
}

export function GenerationPreview({
  result,
  loading,
  onDownload,
  compact,
}: GenerationPreviewProps) {
  const imageSrc = result ? `data:image/${result.format};base64,${result.b64}` : null;
  const { t } = useTranslation();

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          {t("components.preview.title")}
        </p>
        <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-muted/50">
          {loading && <Loader2 className="size-6 animate-spin text-muted-foreground" />}
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
            onClick={onDownload}
          >
            <Download className="mr-1.5 size-3" />
            Download .{result.format}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="flex flex-col gap-0 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("components.preview.title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-muted/50">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t("components.preview.loading")}
              </p>
            </div>
          )}
          {imageSrc && !loading && (
            <img
              src={imageSrc}
              alt={result?.name}
              className="max-h-full max-w-full rounded object-contain"
            />
          )}
          {!imageSrc && !loading && (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="size-12 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                {t("components.preview.empty")}
              </p>
            </div>
          )}
        </div>
        {result && (
          <Button variant="outline" className="w-full" onClick={onDownload}>
            <Download className="mr-2 size-4" />
            Download .{result.format}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
