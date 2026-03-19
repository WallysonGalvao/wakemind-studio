import { Check, ClipboardCopy, Download, Eye, RefreshCw, Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { TIER_COLORS } from "@/constants/achievements";
import { cn } from "@/lib/utils";
import type { AchievementPackage, AchievementPackageItem } from "@/types/achievements";
import { type AchievementTier } from "@/types/achievements";
import type { GeneratedAsset } from "@/types/asset";

interface AchievementGridProps {
  items: AchievementPackageItem[];
  pkg: AchievementPackage;
  assetsByAchievement: Set<string>;
  selectedId: string | null;
  onSelect: (item: AchievementPackageItem) => void;
  onViewAsset: (asset: GeneratedAsset) => void;
  onDownloadAsset: (asset: GeneratedAsset) => void | Promise<void>;
  findAsset: (achievementId: string) => GeneratedAsset | undefined;
}

export function AchievementGrid({
  items,
  pkg,
  assetsByAchievement,
  selectedId,
  onSelect,
  onViewAsset,
  onDownloadAsset,
  findAsset,
}: AchievementGridProps) {
  return (
    <div className="h-full overflow-auto p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          const hasAsset = assetsByAchievement.has(item.id);
          const existingAsset = hasAsset ? findAsset(item.id) : undefined;
          return (
            <ContextMenu key={item.id}>
              <ContextMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "group relative rounded-xl border bg-card text-left shadow-xs transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    isSelected && "border-primary shadow-md ring-2 ring-primary",
                  )}
                  onClick={() => onSelect(item)}
                >
                  {hasAsset && (
                    <div className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-green-500 text-white">
                      <Check className="size-3" />
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-center gap-2 p-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/50 transition-colors group-hover:bg-primary/5">
                      {pkg.renderIcon?.(item.iconName, {
                        size: 24,
                        className:
                          "text-foreground group-hover:text-primary transition-colors",
                      })}
                    </div>
                    <div className="space-y-1 text-center">
                      <p
                        className="w-full truncate text-[11px] leading-tight font-medium"
                        title={item.id}
                      >
                        {item.id}
                      </p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "h-4 px-1 text-[9px] tracking-wider uppercase",
                          TIER_COLORS[item.tier as AchievementTier],
                        )}
                      >
                        {item.tier}
                      </Badge>
                    </div>
                  </div>
                </button>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => onSelect(item)}>
                  <Wand2 className="size-4" />
                  Select for generation
                </ContextMenuItem>
                <ContextMenuItem onClick={() => navigator.clipboard.writeText(item.id)}>
                  <ClipboardCopy className="size-4" />
                  Copy ID
                </ContextMenuItem>
                {existingAsset && (
                  <>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => onViewAsset(existingAsset)}>
                      <Eye className="size-4" />
                      View asset
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => onDownloadAsset(existingAsset)}>
                      <Download className="size-4" />
                      Download asset
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => onSelect(item)}>
                      <RefreshCw className="size-4" />
                      Regenerate
                    </ContextMenuItem>
                  </>
                )}
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>
    </div>
  );
}
