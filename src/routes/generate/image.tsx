import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ImageIcon, Loader2, Wand2 } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { useSettings } from "#/hooks/use-settings";
import {
  generateImage,
  type GenerateImageOptions,
} from "#/services/openai/image";
import {
  DEFAULT_STYLE_CONFIG,
  buildPrompt,
  type StyleConfig,
} from "#/lib/library/image/styles";

export const Route = createFileRoute("/generate/image")({
  component: GenerateImagePage,
});

// ─── Component ────────────────────────────────────────────────────────────────

function GenerateImagePage() {
  const { settings } = useSettings();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [styleJson, setStyleJson] = React.useState(
    JSON.stringify(DEFAULT_STYLE_CONFIG, null, 2),
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
    if (!name.trim()) {
      setError("Please enter a name for the asset.");
      return;
    }

    const styleConfig = parseStyleConfig();
    if (!styleConfig) return;

    const prompt = buildPrompt(
      styleConfig,
      name.trim(),
      description.trim() || undefined,
    );

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
      setResult({ b64, format: fmt, prompt, name: name.trim() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result) return;
    const mimeMap: Record<string, string> = {
      png: "image/png",
      webp: "image/webp",
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
    };
    const mime = mimeMap[result.format] ?? "image/png";
    const ext = result.format;
    const url = `data:${mime};base64,${result.b64}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.name.toLowerCase().replace(/\s+/g, "_")}.${ext}`;
    a.click();
  }

  const imageSrc = result
    ? `data:image/${result.format};base64,${result.b64}`
    : null;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Generate Image</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Generate game assets using the OpenAI image generation API.
        </p>
      </div>

      {!settings.openaiApiKey && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          No OpenAI API key set.{" "}
          <Link
            to="/settings"
            className="underline underline-offset-2 font-medium"
          >
            Go to Settings
          </Link>{" "}
          to add one.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* ── Left column: form ── */}
        <div className="flex flex-col gap-4">
          {/* Asset info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="size-4" />
                Asset
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
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
                  <span className="text-muted-foreground font-normal">
                    (optional — overrides name in prompt)
                  </span>
                </Label>
                <textarea
                  id="description"
                  rows={3}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g. A golden ear of wheat, ripe and glowing, with a few leaves at the base"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Generation options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Generation Options</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label>Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-image-1">gpt-image-1</SelectItem>
                    <SelectItem value="dall-e-3">dall-e-3</SelectItem>
                    <SelectItem value="dall-e-2">dall-e-2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Size</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
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

              <div className="flex flex-col gap-1.5">
                <Label>Quality (dall-e-3)</Label>
                <Select
                  value={quality}
                  onValueChange={(v) => setQuality(v as "standard" | "hd")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="hd">HD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Background</Label>
                <Select value={background} onValueChange={setBackground}>
                  <SelectTrigger>
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

          {/* Style config JSON */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Style Config</CardTitle>
              <CardDescription>
                JSON style definition — same format as the{" "}
                <code className="bg-muted rounded px-1 text-xs">*.json</code>{" "}
                files in image-creation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                rows={16}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 font-mono text-xs shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={styleJson}
                onChange={(e) => {
                  setStyleJson(e.target.value);
                  setStyleError("");
                }}
                spellCheck={false}
              />
              {styleError && (
                <p className="text-destructive mt-1.5 text-xs">{styleError}</p>
              )}
            </CardContent>
          </Card>

          {error && (
            <p className="text-destructive rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm dark:border-red-900 dark:bg-red-950/30">
              {error}
            </p>
          )}

          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={loading}
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
        </div>

        {/* ── Right column: preview ── */}
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-0 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="bg-muted/50 border-border flex aspect-square w-full items-center justify-center rounded-lg border">
                {loading && (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="text-muted-foreground size-8 animate-spin" />
                    <p className="text-muted-foreground text-sm">
                      Generating image…
                    </p>
                  </div>
                )}
                {imageSrc && !loading && (
                  <img
                    src={imageSrc}
                    alt={result?.name}
                    className="max-h-full max-w-full object-contain rounded"
                  />
                )}
                {!imageSrc && !loading && (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="text-muted-foreground/40 size-12" />
                    <p className="text-muted-foreground text-xs">
                      Your image will appear here
                    </p>
                  </div>
                )}
              </div>

              {result && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 size-4" />
                  Download .{result.format}
                </Button>
              )}
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Generated Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs leading-relaxed wrap-break-word">
                  {result.prompt}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
