import { createFileRoute } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BASIC_ACHIEVEMENT_PACKAGE } from "@/lib/library/achievements/packages/basic";
import { cn } from "@/lib/utils";
import { AchievementTier } from "@/types/achievements";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
});

const TIER_COLORS = {
  [AchievementTier.BRONZE]:
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900/50",
  [AchievementTier.SILVER]:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-800",
  [AchievementTier.GOLD]:
    "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50",
  [AchievementTier.PLATINUM]:
    "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-900/50",
};

function LibraryPage() {
  const packages = [BASIC_ACHIEVEMENT_PACKAGE];

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground">
            Manage and preview achievement icon packages.
          </p>
        </div>
      </div>

      <Tabs defaultValue="basic" className="flex min-h-0 flex-1 flex-col gap-6">
        <TabsList className="w-fit">
          {packages.map((pkg) => (
            <TabsTrigger key={pkg.id} value={pkg.id}>
              {pkg.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {packages.map((pkg) => (
          <TabsContent
            key={pkg.id}
            value={pkg.id}
            className="min-h-0 flex-1 data-[state=inactive]:hidden"
          >
            <div className="flex h-full flex-col gap-4">
              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div>
                  <h2 className="text-lg font-semibold">{pkg.name}</h2>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                </div>
                <Badge variant="outline">{pkg.items.length} Achievements</Badge>
              </div>

              <div className="flex-1 overflow-auto rounded-md border border-border bg-card/50">
                <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                  {pkg.items.map((item) => (
                    <Card
                      key={item.id}
                      className="group transition-shadow hover:shadow-md"
                    >
                      <CardHeader className="flex flex-col items-center justify-center gap-3 p-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted/50 transition-colors group-hover:bg-primary/5">
                          {pkg.renderIcon(item.iconName, {
                            size: 32,
                            className:
                              "text-foreground group-hover:text-primary transition-colors",
                          })}
                        </div>
                        <div className="space-y-1 text-center">
                          <p
                            className="w-full truncate text-xs leading-tight font-medium"
                            title={item.id}
                          >
                            {item.id}
                          </p>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "h-4 px-1 text-[10px] tracking-wider uppercase",
                              TIER_COLORS[item.tier as AchievementTier],
                            )}
                          >
                            {item.tier}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
