import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import type { GenerationOptions } from "#/types/generation";

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
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Generation Options</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Model</Label>
          <Select value={options.model} onValueChange={(v) => onOptionChange("model", v)}>
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
          <Select value={options.size} onValueChange={(v) => onOptionChange("size", v)}>
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
            value={options.quality}
            onValueChange={(v) => onOptionChange("quality", v as "standard" | "hd")}
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
          <Select
            value={options.format}
            onValueChange={(v) => onOptionChange("format", v)}
          >
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
          <Select
            value={options.background}
            onValueChange={(v) => onOptionChange("background", v)}
          >
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
  );
}
