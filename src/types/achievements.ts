export enum AchievementCategory {
  PROGRESSION = 'PROGRESSION',
  CONSISTENCY = 'CONSISTENCY',
  MASTERY = 'MASTERY',
  EXPLORATION = 'EXPLORATION',
  SECRET = 'SECRET',
  SOCIAL = 'SOCIAL',
}

export enum AchievementTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  isSecret: boolean;
  isPremium?: boolean;
  target: number;
  useSkiaIcon?: boolean;
  use3DIcon?: boolean;
}
