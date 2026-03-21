import { supabase } from "@/lib/supabase";
import type { AssetStats, DailyActivity, GeneratedAsset } from "@/types/asset";
import type { Json } from "@/types/supabase";

const BUCKET = "assets";
const SIGNED_URL_TTL = 3600; // 1 hour
const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

// ── Storage helpers ───────────────────────────────────────────────────────────

/** Upload a base64-encoded image to Supabase Storage. Returns the storage path. */
export async function uploadAssetFile(
  userId: string,
  projectId: string,
  assetId: string,
  b64: string,
  mimeType: string,
  format: string,
): Promise<string> {
  const byteChars = atob(b64);
  const byteArray = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteArray[i] = byteChars.charCodeAt(i);
  }

  if (byteArray.length > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error(`File exceeds maximum upload size of 50 MB`);
  }

  const allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "audio/mpeg",
    "audio/wav",
    "audio/opus",
    "audio/aac",
    "audio/flac",
  ];
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  const blob = new Blob([byteArray], { type: mimeType });

  const path = `${userId}/${projectId}/${assetId}.${format}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: mimeType,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

/** Generate a signed URL for viewing. */
async function getSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL);
  if (error) throw error;
  return data.signedUrl;
}

/** Generate a signed URL for download. */
export async function getDownloadUrl(
  storagePath: string,
  fileName: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60, { download: fileName });
  if (error) throw error;
  return data.signedUrl;
}

// ── DB helpers ────────────────────────────────────────────────────────────────

export async function saveAsset(
  asset: Omit<GeneratedAsset, "imageUrl">,
  projectId: string,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("assets").insert({
    id: asset.id,
    name: asset.name,
    type: asset.type,
    package_id: asset.packageId ?? null,
    project_id: projectId,
    model: asset.model,
    prompt: asset.prompt,
    settings: asset.settings as Json,
    storage_path: asset.storagePath,
    mime_type: asset.mimeType,
    format: asset.mimeType.split("/")[1] ?? "png",
    created_at: asset.createdAt,
    user_id: user.id,
  });
  if (error) throw error;
}

export async function getAllAssets(projectId: string): Promise<GeneratedAsset[]> {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  // Generate signed URLs for all assets in parallel
  const assets: GeneratedAsset[] = await Promise.all(
    (data ?? []).map(async (row) => {
      const imageUrl = await getSignedUrl(row.storage_path as string).catch(() => "");
      return {
        id: row.id as string,
        name: row.name as string,
        type: row.type as GeneratedAsset["type"],
        packageId: row.package_id as string | undefined,
        model: row.model as string,
        prompt: row.prompt as string,
        settings: row.settings as Record<string, unknown>,
        storagePath: row.storage_path as string,
        mimeType: row.mime_type as string,
        createdAt: row.created_at as number,
        imageUrl,
      };
    }),
  );
  return assets;
}

export async function deleteAsset(id: string): Promise<void> {
  // Fetch the storage path first so we can remove the file too
  const { data, error: fetchErr } = await supabase
    .from("assets")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (fetchErr) throw fetchErr;

  const { error: dbErr } = await supabase.from("assets").delete().eq("id", id);
  if (dbErr) throw dbErr;

  if (data?.storage_path) {
    await supabase.storage.from(BUCKET).remove([data.storage_path as string]);
  }
}

// ── Stats helpers (identical interface to storage/assets.ts) ─────────────────

export function computeStats(assets: GeneratedAsset[]): AssetStats {
  const images = assets.filter((a) => a.type === "image").length;
  const sounds = assets.filter((a) => a.type === "sound").length;
  return {
    total: assets.length,
    images,
    sounds,
    storageMb: 0, // Supabase Storage tracks this server-side
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
