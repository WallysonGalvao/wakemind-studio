import type { AssetStats, DailyActivity, GeneratedAsset } from "@/types/asset";

import { ASSETS_STORE, dbAdd, dbDelete, dbGetAll } from "./db";

export async function saveAsset(asset: GeneratedAsset): Promise<void> {
  await dbAdd<GeneratedAsset>(ASSETS_STORE, asset);
}

export async function getAllAssets(): Promise<GeneratedAsset[]> {
  const assets = await dbGetAll<GeneratedAsset>(ASSETS_STORE);
  return assets.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteAsset(id: string): Promise<void> {
  await dbDelete(ASSETS_STORE, id);
}

export function computeStats(assets: GeneratedAsset[]): AssetStats {
  const images = assets.filter((a) => a.type === "image").length;
  const sounds = assets.filter((a) => a.type === "sound").length;
  // Rough storage estimate: base64 chars × 0.75 = bytes
  const totalBytes = assets.reduce(
    (sum, a) => sum + Math.ceil(a.imageData.length * 0.75),
    0,
  );
  return {
    total: assets.length,
    images,
    sounds,
    storageMb: Math.round((totalBytes / 1024 / 1024) * 100) / 100,
  };
}

export function computeActivity(assets: GeneratedAsset[], days: number): DailyActivity[] {
  const now = new Date();
  const activity: DailyActivity[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    activity.push({ date: d.toISOString().slice(0, 10), images: 0, sounds: 0 });
  }

  for (const asset of assets) {
    const dateStr = new Date(asset.createdAt).toISOString().slice(0, 10);
    const entry = activity.find((a) => a.date === dateStr);
    if (entry) {
      if (asset.type === "image") entry.images++;
      else entry.sounds++;
    }
  }

  return activity;
}
