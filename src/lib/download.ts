import { getDownloadUrl } from "@/services/supabase/assets";
import type { GeneratedAsset } from "@/types/asset";

const MIME_MAP: Record<string, string> = {
  png: "image/png",
  webp: "image/webp",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
};

export async function downloadAsset(asset: GeneratedAsset) {
  const ext = asset.mimeType.split("/")[1] ?? "png";
  const fileName = `${asset.name.toLowerCase().replace(/\s+/g, "_")}.${ext}`;

  // Prefer signed download URL from Storage; fall back to imageUrl if available
  try {
    const url = await getDownloadUrl(asset.storagePath, fileName);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  } catch {
    if (asset.imageUrl) {
      const a = document.createElement("a");
      a.href = asset.imageUrl;
      a.download = fileName;
      a.click();
    }
  }
}

export function downloadBase64(b64: string, format: string, name: string) {
  const mime = MIME_MAP[format] ?? "image/png";
  const a = document.createElement("a");
  a.href = `data:${mime};base64,${b64}`;
  a.download = `${name.toLowerCase().replace(/\s+/g, "_")}.${format}`;
  a.click();
}
