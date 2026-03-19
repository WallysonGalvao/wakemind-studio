import React from "react";

import { MaterialSymbol } from "@/components/ui/material-symbol";
import { ACHIEVEMENT_REGISTRY } from "@/constants/achievements";
import { DEFAULT_STYLE_CONFIG } from "@/lib/library/image/styles";
import type { AchievementPackage } from "@/types/achievements";

/**
 * Basic Achievement Package
 * Uses Material Symbols (Font) as icons.
 * This is the original design from the mobile app.
 */
export const BASIC_ACHIEVEMENT_PACKAGE: AchievementPackage = {
  id: "basic",
  name: "Basic Symbols",
  description: "Official Material Symbols icons used in the mobile app.",
  color: "#135bec",
  isBuiltIn: true,
  createdAt: 0,
  styleConfig: DEFAULT_STYLE_CONFIG,
  renderIcon: (
    name: string,
    props?: { size?: number; color?: string; className?: string },
  ) => {
    return React.createElement(MaterialSymbol, { name, ...props });
  },
  items: ACHIEVEMENT_REGISTRY.map((achievement) => ({
    id: achievement.id,
    iconName: achievement.icon,
    tier: achievement.tier,
    category: achievement.category,
  })),
};
