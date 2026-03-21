import { HardDrive, ImageIcon, Layers, Music } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AssetStats } from "@/types/asset";

interface SectionCardsProps {
  stats: AssetStats;
}

export function SectionCards({ stats }: SectionCardsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("pages.dashboard.stats.totalAssets")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.total}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Layers className="size-4" /> {t("pages.dashboard.stats.totalAssetsDesc")}
          </div>
          <div className="text-muted-foreground">
            {t("pages.dashboard.stats.combined")}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("pages.dashboard.stats.imagesGenerated")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.images}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <ImageIcon className="size-4" />{" "}
            {t("pages.dashboard.stats.imagesGeneratedDesc")}
          </div>
          <div className="text-muted-foreground">
            {t("pages.dashboard.stats.imagesGeneratedFooter")}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("pages.dashboard.stats.soundsGenerated")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.sounds}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Music className="size-4" /> {t("pages.dashboard.stats.soundsGeneratedDesc")}
          </div>
          <div className="text-muted-foreground">
            {t("pages.dashboard.stats.soundsGeneratedFooter")}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("pages.dashboard.stats.storageUsed")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.storageMb} MB
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <HardDrive className="size-4" /> {t("pages.dashboard.stats.storageUsedDesc")}
          </div>
          <div className="text-muted-foreground">
            {t("pages.dashboard.stats.storageUsedFooter")}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
