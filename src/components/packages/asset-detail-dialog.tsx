import { Download, Trash2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadAsset } from "@/lib/download";
import { formatDate } from "@/lib/utils";
import type { AchievementPackage } from "@/types/achievements";
import type { GeneratedAsset } from "@/types/asset";

interface AssetDetailDialogProps {
  asset: GeneratedAsset | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  allPackages: AchievementPackage[];
}

export function AssetDetailDialog({
  asset,
  open,
  onClose,
  onDelete,
  allPackages,
}: AssetDetailDialogProps) {
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    if (!asset) return;
    setDeleting(true);
    await onDelete(asset.id);
    setDeleting(false);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-y-auto p-0">
        {asset && (
          <>
            <DialogHeader className="border-b p-6 pb-4">
              <DialogTitle className="truncate">{asset.name}</DialogTitle>
              <DialogDescription>{formatDate(asset.createdAt)}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6 p-6">
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/50">
                <img
                  src={`data:${asset.mimeType};base64,${asset.imageData}`}
                  alt={asset.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium">
                  {allPackages.find((p) => p.id === asset.packageId)?.name ??
                    asset.packageId ??
                    "—"}
                </span>
                <span className="text-muted-foreground">Model</span>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {asset.model}
                </code>
                <span className="text-muted-foreground">Type</span>
                <span className="capitalize">{asset.type}</span>
                {Object.entries(asset.settings).map(([k, v]) => (
                  <React.Fragment key={k}>
                    <span className="text-muted-foreground capitalize">{k}</span>
                    <span>{String(v)}</span>
                  </React.Fragment>
                ))}
              </div>

              {asset.prompt && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Prompt
                  </p>
                  <p className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
                    {asset.prompt}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => asset && downloadAsset(asset)}>
                  <Download className="size-4" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleDelete}
                  disabled={deleting}
                  aria-label="Delete asset"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
