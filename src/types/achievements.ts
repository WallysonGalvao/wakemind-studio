import type React from "react";

export enum AchievementCategory {
  PROGRESSION = "PROGRESSION",
  CONSISTENCY = "CONSISTENCY",
  MASTERY = "MASTERY",
  EXPLORATION = "EXPLORATION",
  SECRET = "SECRET",
  SOCIAL = "SOCIAL",
}

export enum AchievementTier {
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
}

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  isSecret: boolean;
  isPremium?: boolean;
  target: number;
}

export interface AchievementPackageItem {
  id: string;
  iconName: string;
  tier: AchievementTier;
  category: AchievementCategory;
}

export interface AchievementPackage {
  id: string;
  name: string;
  description: string;
  color: string;
  isBuiltIn: boolean;
  createdAt: number;
  styleConfig: Record<string, unknown>;
  renderIcon?: (
    name: string,
    props?: { size?: number; color?: string; className?: string },
  ) => React.ReactElement;
  items: AchievementPackageItem[];
}
