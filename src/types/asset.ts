export type AssetType = "image" | "sound";

export interface GeneratedAsset {
  id: string;
  name: string;
  type: AssetType;
  packageId?: string; // which asset package this belongs to
  model: string;
  prompt: string;
  settings: Record<string, unknown>;
  imageData: string; // base64-encoded file content
  mimeType: string; // e.g. "image/png"
  createdAt: number; // Date.now()
}

export interface AssetStats {
  total: number;
  images: number;
  sounds: number;
  storageMb: number;
}

export interface DailyActivity {
  date: string; // "YYYY-MM-DD"
  images: number;
  sounds: number;
}
