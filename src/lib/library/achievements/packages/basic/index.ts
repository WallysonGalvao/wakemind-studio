import React from "react";

import { MaterialSymbol } from "@/components/ui/material-symbol";
import { ACHIEVEMENT_REGISTRY } from "@/constants/achievements";

/**
 * Basic Achievement Package
 * Uses Material Symbols (Font) as icons.
 * This is the original design from the mobile app.
 */
export const BASIC_ACHIEVEMENT_PACKAGE = {
  id: "basic",
  name: "Basic Symbols",
  description: "Official Material Symbols icons used in the mobile app.",
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
