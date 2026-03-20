import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCards } from "@/components/dashboard/section-cards";
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
});

function Dashboard() {
  const { t } = useTranslation();
  const { assets, stats, activity90d } = Route.useLoaderData();
  const project = useProject();
  const router = useRouter();

  async function handleDelete(id: string) {
    await deleteAsset(id);
    await router.invalidate();
  }

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
      <DataTable data={assets} onDelete={handleDelete} />
    </div>
  );
}
