import { Plus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACHIEVEMENT_REGISTRY } from "@/constants/achievements";
import { PACKAGE_COLOR_PRESETS } from "@/constants/packages";
import { cn } from "@/lib/utils";
import { savePackage } from "@/services/storage/packages";
import type { AchievementPackage } from "@/types/achievements";

interface CreatePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreatePackageDialog({
  open,
  onOpenChange,
  onCreated,
}: CreatePackageDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [color, setColor] = React.useState<string>(PACKAGE_COLOR_PRESETS[0]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  function reset() {
    setName("");
    setDescription("");
    setColor(PACKAGE_COLOR_PRESETS[0]);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Package name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const pkg: AchievementPackage = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description.trim(),
        color,
        isBuiltIn: false,
        createdAt: Date.now(),
        styleConfig: {},
        items: ACHIEVEMENT_REGISTRY.map((a) => ({
          id: a.id,
          iconName: a.icon,
          tier: a.tier,
          category: a.category,
        })),
      };
      await savePackage(pkg);
      reset();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create package.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Package</DialogTitle>
          <DialogDescription>
            Create a custom asset package to organize your generated images.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-name">Name *</Label>
            <Input
              id="pkg-name"
              placeholder="e.g. Fantasy Icons, Pixel Items…"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-desc">Description</Label>
            <Input
              id="pkg-desc"
              placeholder="Brief description of this package"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PACKAGE_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={cn(
                    "size-8 rounded-lg border-2 transition-all",
                    color === preset
                      ? "scale-110 border-foreground"
                      : "border-transparent hover:scale-105",
                  )}
                  style={{ backgroundColor: preset }}
                  onClick={() => setColor(preset)}
                  aria-label={`Color ${preset}`}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={saving} className="mt-2">
            <Plus className="size-4" />
            {saving ? "Creating…" : "Create Package"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
