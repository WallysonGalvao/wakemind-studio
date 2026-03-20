import { Download, Eye, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  onDownload: (asset: GeneratedAsset) => void | Promise<void>;
}

export function AssetGrid({ assets, onSelect, onDelete, onDownload }: AssetGridProps) {
  const { t } = useTranslation();
  if (assets.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-sm">{t("components.assetGrid.empty")}</p>
        <p className="text-xs">{t("components.assetGrid.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {assets.map((asset) => (
          <AssetItem
            key={asset.id}
            asset={asset}
            onSelect={onSelect}
            onDelete={onDelete}
            onDownload={onDownload}
          />
        ))}
      </div>
    </div>
  );
}

function AssetItem({
  asset,
  onSelect,
  onDelete,
  onDownload,
}: {
  asset: GeneratedAsset;
  onSelect: (asset: GeneratedAsset) => void;
  onDelete: (id: string) => void;
  onDownload: (asset: GeneratedAsset) => void | Promise<void>;
}) {
  const { t } = useTranslation();
  function handleSelect() {
    onSelect(asset);
  }

  function handleDownload() {
    onDownload(asset);
  }

  function handleDelete() {
    onDelete(asset.id);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={handleSelect}
        >
          <div className="flex aspect-square w-full items-center justify-center bg-muted/50">
            <img
              src={asset.imageUrl ?? ""}
              alt={asset.name}
              className="max-h-full max-w-full object-contain p-2"
            />
          </div>
          <div className="flex flex-col gap-0.5 p-2 text-left">
            <p className="truncate text-xs leading-tight font-medium">{asset.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {formatDate(asset.createdAt)}
            </p>
          </div>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleSelect}>
          <Eye className="size-4" />
          {t("components.assetGrid.contextMenu.viewDetails")}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDownload}>
          <Download className="size-4" />
          {t("components.assetGrid.contextMenu.download")}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onClick={handleDelete}>
          <Trash2 className="size-4" />
          {t("components.assetGrid.contextMenu.delete")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
