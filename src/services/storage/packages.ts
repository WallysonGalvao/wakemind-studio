import type { AchievementPackage } from "@/types/achievements";

import { dbAdd, dbDelete, dbGetAll, PACKAGES_STORE } from "./db";

export async function savePackage(pkg: AchievementPackage): Promise<void> {
  await dbAdd<AchievementPackage>(PACKAGES_STORE, pkg);
}

export async function getAllCustomPackages(): Promise<AchievementPackage[]> {
  const packages = await dbGetAll<AchievementPackage>(PACKAGES_STORE);
  return packages.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deletePackage(id: string): Promise<void> {
  await dbDelete(PACKAGES_STORE, id);
}
