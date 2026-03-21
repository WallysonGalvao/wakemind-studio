import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCards } from "@/components/dashboard/section-cards";
import { RouteErrorFallback } from "@/components/ui/route-error-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/hooks/use-project";
import {
  computeActivity,
  computeStats,
  deleteAsset,
  getAllAssets,
} from "@/services/supabase/assets";

export const Route = createFileRoute("/$projectSlug/dashboard")({
  loader: async ({ context }) => {
    const { project } = context as { project: { id: string } };
    const assets = await getAllAssets(project.id);
    const stats = computeStats(assets);
    const activity90d = computeActivity(assets, 90);
    return { assets, stats, activity90d };
  },
  component: Dashboard,
  errorComponent: RouteErrorFallback,
  pendingComponent: DashboardSkeleton,
});

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="px-4 lg:px-6">
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <div className="px-4 lg:px-6">
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

function Dashboard() {
  const { t } = useTranslation();
  const { assets, stats, activity90d } = Route.useLoaderData();
  const project = useProject();
  const router = useRouter();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAsset(id),
    onSuccess: () => {
      toast.success(t("toast.assetDeleted"));
    },
    onError: () => {
      toast.error(t("toast.assetDeleteFailed"));
    },
    onSettled: () => {
      router.invalidate();
    },
  });

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("pages.dashboard.subtitle")}
        </p>
      </div>
      <SectionCards stats={stats} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive data={activity90d} />
      </div>
      <DataTable data={assets} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}
