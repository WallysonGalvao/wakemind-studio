export type AssetType = "image" | "sound";

export interface GeneratedAsset {
  id: string;
  name: string;
  type: AssetType;
  packageId?: string; // which asset package this belongs to
  model: string;
  prompt: string;
  settings: Record<string, unknown>;
  storagePath: string; // path in Supabase Storage: {userId}/{assetId}.{format}
  imageUrl?: string; // runtime field: signed URL populated on load (not persisted)
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
