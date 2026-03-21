import { BASIC_ACHIEVEMENT_PACKAGE } from "@/lib/library/achievements/packages/basic";
import type { AchievementPackage } from "@/types/achievements";

/** All built-in achievement packages */
export const BUILT_IN_PACKAGES: AchievementPackage[] = [BASIC_ACHIEVEMENT_PACKAGE];

export function getPackageById(
  id: string,
  allPackages: AchievementPackage[] = BUILT_IN_PACKAGES,
): AchievementPackage | undefined {
  return allPackages.find((p) => p.id === id);
}

/** Preset colors for custom package creation */
export const PACKAGE_COLOR_PRESETS = [
  "#135bec", // brand blue
  "#e11d48", // rose
  "#16a34a", // green
  "#ea580c", // orange
  "#7c3aed", // violet
  "#0891b2", // cyan
  "#ca8a04", // yellow
  "#64748b", // slate
  "#dc2626", // red
  "#059669", // emerald
] as const;
