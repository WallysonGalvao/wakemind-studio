import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod/v4";

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
import { savePackage } from "@/services/supabase/packages";
import type { AchievementPackage } from "@/types/achievements";

interface CreatePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  projectId: string;
}

const createPackageSchema = z.object({
  name: z.string().min(1, "Package name is required").max(50, "Name is too long"),
  description: z.string().max(200, "Description is too long").optional(),
  color: z.string().min(1),
});

type CreatePackageFields = z.infer<typeof createPackageSchema>;

export function CreatePackageDialog({
  open,
  onOpenChange,
  onCreated,
  projectId,
}: CreatePackageDialogProps) {
  "use no memo";
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
    setError,
  } = useForm<CreatePackageFields>({
    resolver: zodResolver(createPackageSchema),
    defaultValues: { name: "", description: "", color: PACKAGE_COLOR_PRESETS[0] },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedColor = watch("color");

  const handleOpenChange = React.useCallback(
    (v: boolean) => {
      if (!v) reset();
      onOpenChange(v);
    },
    [reset, onOpenChange],
  );

  const saveMutation = useMutation({
    mutationFn: (pkg: AchievementPackage) => savePackage(pkg, projectId),
    onSuccess: () => {
      toast.success(t("toast.packageCreated"));
      reset();
      onOpenChange(false);
      onCreated();
    },
    onError: (err) => {
      toast.error(t("toast.packageCreateFailed"));
      setError("root", {
        message: err instanceof Error ? err.message : "Failed to create package.",
      });
    },
  });

  async function onSubmit({ name, description, color }: CreatePackageFields) {
    const pkg: AchievementPackage = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description?.trim() ?? "",
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
    saveMutation.mutate(pkg);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("components.createPackage.title")}</DialogTitle>
          <DialogDescription>
            {t("components.createPackage.description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-name">{t("components.createPackage.nameLabel")}</Label>
            <Input
              id="pkg-name"
              placeholder={t("components.createPackage.namePlaceholder")}
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-desc">
              {t("components.createPackage.descriptionLabel")}
            </Label>
            <Input
              id="pkg-desc"
              placeholder={t("components.createPackage.descriptionPlaceholder")}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("components.createPackage.colorLabel")}</Label>
            <div className="flex flex-wrap gap-2">
              {PACKAGE_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={cn(
                    "size-8 rounded-lg border-2 transition-all",
                    selectedColor === preset
                      ? "scale-110 border-foreground"
                      : "border-transparent hover:scale-105",
                  )}
                  style={{ backgroundColor: preset }}
                  onClick={() => setValue("color", preset)}
                  aria-label={t("components.createPackage.colorAriaLabel", { preset })}
                />
              ))}
            </div>
          </div>

          {errors.root && (
            <p className="text-sm text-destructive">{errors.root.message}</p>
          )}

          <Button type="submit" disabled={saveMutation.isPending} className="mt-2">
            <Plus className="size-4" />
            {saveMutation.isPending
              ? t("components.createPackage.creating")
              : t("components.createPackage.createBtn")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
