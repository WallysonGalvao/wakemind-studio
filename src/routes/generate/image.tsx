import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, ImageIcon, Loader2, Settings2, Wand2 } from "lucide-react";
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

export const Route = createFileRoute("/generate/image")({
  component: GenerateImagePage,
});

// ─── Style config ────────────────────────────────────────────────────────────

const DEFAULT_STYLE_CONFIG = {
  icon_style: {
    perspective: "soft isometric (slight tilt, friendly angle)",
    geometry: {
      proportions: "1:1 square canvas, generous breathing room around object",
      element_arrangement:
        "single centered main object, optional tiny secondary detail for context",
    },
    composition: {
      element_count: "1–2 objects only",
      scene_density: "minimal, calm, uncluttered",
    },
    lighting: {
      type: "soft diffuse daylight",
      light_source: "top-left or top-center, evenly spread",
      shadow: "very soft grounding shadow, close to object",
      highlighting: "subtle highlights, no sharp specular shine",
    },
    textures: {
      material_finish: "soft matte, lightly handcrafted feel",
      surface_treatment:
        "stylized, cozy realism (faint grain lines, soft fabric, gentle food texture)",
    },
    render_quality: {
      resolution: "high-resolution stylized 3D or painterly render",
      edge_definition: "soft edges, no hard outlines",
      visual_clarity: "clear silhouette, instantly readable at small sizes",
    },
    color_palette: {
      tone: "warm, natural, comforting",
      range: "earthy pastels and muted naturals (no neon, no harsh contrast)",
    },
    background: {
      color: "transparent",
    },
    stylistic_tone: "cozy, wholesome, calm, handcrafted, storybook-farm",
    constraints: {
      avoid: [
        "photorealism",
        "plastic shine",
        "hard shadows",
        "busy scenes",
        "text or labels",
        "background elements",
      ],
    },
  },
};

// ─── Prompt builder (port of image-creation/lib/styles.ts) ───────────────────

type StyleConfig = typeof DEFAULT_STYLE_CONFIG;

function buildPrompt(
  styleConfig: StyleConfig,
  name: string,
  description?: string,
): string {
  const style = styleConfig.icon_style;
  const parts: string[] = [];

  parts.push(description ? description : `An icon for ${name}`);

  if (style.perspective) parts.push(style.perspective);
  if (style.stylistic_tone) parts.push(style.stylistic_tone + " style");

  if (style.composition) {
    if (style.composition.element_count)
      parts.push(style.composition.element_count);
    if (style.composition.scene_density)
      parts.push(style.composition.scene_density);
  }

  if (style.geometry) {
    if (style.geometry.proportions) parts.push(style.geometry.proportions);
    if (style.geometry.element_arrangement)
      parts.push(style.geometry.element_arrangement);
  }

  if (style.lighting) {
    if (style.lighting.type) parts.push(style.lighting.type);
    if (style.lighting.light_source)
      parts.push(`light from ${style.lighting.light_source}`);
    if (style.lighting.shadow) parts.push(style.lighting.shadow);
    if (style.lighting.highlighting) parts.push(style.lighting.highlighting);
  }

  if (style.textures) {
    if (style.textures.material_finish)
      parts.push(style.textures.material_finish);
    if (style.textures.surface_treatment)
      parts.push(style.textures.surface_treatment);
  }

  if (style.render_quality) {
    if (style.render_quality.resolution)
      parts.push(style.render_quality.resolution);
    if (style.render_quality.edge_definition)
      parts.push(style.render_quality.edge_definition);
    if (style.render_quality.visual_clarity)
      parts.push(style.render_quality.visual_clarity);
  }

  if (style.color_palette) {
    if (style.color_palette.tone)
      parts.push(`${style.color_palette.tone} tones`);
    if (style.color_palette.range) parts.push(style.color_palette.range);
  }

  const bgColor = style.background?.color;
  if (bgColor) {
    if (bgColor.toLowerCase() === "transparent") {
      parts.push("transparent background, no background");
    } else {
      parts.push(`${bgColor} background`);
    }
  }

  if (style.constraints?.avoid?.length) {
    parts.push(`avoid: ${style.constraints.avoid.join(", ")}`);
  }

  return parts.join(", ");
}

// ─── OpenAI image generation ─────────────────────────────────────────────────

type GenerateOptions = {
  model: string;
  size: string;
  quality: string;
  format: string;
  background: string;
};

async function generateImageFromOpenAI(
  apiKey: string,
  prompt: string,
  options: GenerateOptions,
): Promise<{ b64: string; format: string }> {
  const body: Record<string, unknown> = {
    model: options.model,
    prompt,
    n: 1,
    size: options.size,
  };

  if (options.model === "dall-e-3") {
    body.quality = options.quality;
  }

  if (options.model === "gpt-image-1") {
    body.output_format = options.format;
    if (options.background === "transparent") {
      body.background = "transparent";
    }
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ??
        `API error ${response.status}`,
    );
  }

  const data = (await response.json()) as {
    data: Array<{ b64_json?: string; url?: string }>;
  };

  const imageData = data.data[0];

  if (imageData.b64_json) {
    return { b64: imageData.b64_json, format: options.format };
  }

  if (imageData.url) {
    // Proxy not available – fetch URL and convert to b64 via blob
    const imgRes = await fetch(imageData.url);
    const blob = await imgRes.blob();
    const b64 = await blobToBase64(blob);
    return { b64, format: options.format };
  }

  throw new Error("No image data received from API");
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip "data:...;base64," prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

const LOCAL_API_KEY = "wakemind_openai_api_key";

function GenerateImagePage() {
  const [apiKey, setApiKey] = React.useState(
    () => localStorage.getItem(LOCAL_API_KEY) ?? "",
  );
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

  function saveApiKey() {
    localStorage.setItem(LOCAL_API_KEY, apiKey);
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
    if (!apiKey) {
      setError("Please enter your OpenAI API key.");
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
      const { b64, format: fmt } = await generateImageFromOpenAI(
        apiKey,
        prompt,
        {
          model,
          size,
          quality,
          format,
          background,
        },
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

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* ── Left column: form ── */}
        <div className="flex flex-col gap-4">
          {/* API Key */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="size-4" />
                API Key
              </CardTitle>
              <CardDescription>
                Your OpenAI key is stored only in this browser (localStorage).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="sm" onClick={saveApiKey}>
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>

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
