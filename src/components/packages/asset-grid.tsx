import { Download, Eye, Trash2 } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { formatDate } from "@/lib/utils";
import type { GeneratedAsset } from "@/types/asset";

interface AssetGridProps {
  assets: GeneratedAsset[];
  onSelect: (asset: GeneratedAsset) => void;
  onDelete: (id: string) => void;
  onDownload: (asset: GeneratedAsset) => void;
}

export function AssetGrid({ assets, onSelect, onDelete, onDownload }: AssetGridProps) {
  if (assets.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-sm">No assets generated yet.</p>
        <p className="text-xs">Select an achievement and click Generate.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {assets.map((asset) => (
          <ContextMenu key={asset.id}>
            <ContextMenuTrigger asChild>
              <button
                type="button"
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                onClick={() => onSelect(asset)}
              >
                <div className="flex aspect-square w-full items-center justify-center bg-muted/50">
                  <img
                    src={`data:${asset.mimeType};base64,${asset.imageData}`}
                    alt={asset.name}
                    className="max-h-full max-w-full object-contain p-2"
                  />
                </div>
                <div className="flex flex-col gap-0.5 p-2 text-left">
                  <p className="truncate text-xs leading-tight font-medium">
                    {asset.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(asset.createdAt)}
                  </p>
                </div>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => onSelect(asset)}>
                <Eye className="size-4" />
                View details
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onDownload(asset)}>
                <Download className="size-4" />
                Download
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem variant="destructive" onClick={() => onDelete(asset.id)}>
                <Trash2 className="size-4" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
    </div>
  );
}
