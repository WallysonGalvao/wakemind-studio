import type { GeneratedAsset } from "#/types/asset";

const MIME_MAP: Record<string, string> = {
  png: "image/png",
  webp: "image/webp",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
};

export function downloadAsset(asset: GeneratedAsset) {
  const a = document.createElement("a");
  a.href = `data:${asset.mimeType};base64,${asset.imageData}`;
  const ext = asset.mimeType.split("/")[1] ?? "png";
  a.download = `${asset.name.toLowerCase().replace(/\s+/g, "_")}.${ext}`;
  a.click();
}

export function downloadBase64(b64: string, format: string, name: string) {
  const mime = MIME_MAP[format] ?? "image/png";
  const a = document.createElement("a");
  a.href = `data:${mime};base64,${b64}`;
  a.download = `${name.toLowerCase().replace(/\s+/g, "_")}.${format}`;
  a.click();
}
