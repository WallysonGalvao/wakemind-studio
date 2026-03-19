import { Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AchievementPackage } from "@/types/achievements";

interface PackageHeaderProps {
  pkg: AchievementPackage;
  achievementCount: number;
  assetCount: number;
  onExport?: () => void;
}

export function PackageHeader({
  pkg,
  achievementCount,
  assetCount,
  onExport,
}: PackageHeaderProps) {
  return (
    <div className="flex items-start gap-4 border-b p-4">
      <Button variant="ghost" size="icon" asChild className="mt-0.5 shrink-0">
        <Link to="/library">
          <ArrowLeft className="size-4" />
          <span className="sr-only">Back to Library</span>
        </Link>
      </Button>
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: pkg.color }}
          >
            {pkg.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{pkg.name}</h1>
            <p className="text-xs text-muted-foreground">{pkg.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {achievementCount > 0 && (
            <Badge variant="outline">{achievementCount} Achievements</Badge>
          )}
          <Badge variant="secondary">{assetCount} Assets</Badge>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="size-4" />
              Export JSON
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
