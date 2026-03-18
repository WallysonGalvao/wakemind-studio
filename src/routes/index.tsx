import { createFileRoute, useRouter } from "@tanstack/react-router";

import { ChartAreaInteractive } from "#/components/dashboard/chart-area-interactive";
import { DataTable } from "#/components/dashboard/data-table";
import { SectionCards } from "#/components/dashboard/section-cards";
import {
  computeActivity,
  computeStats,
  deleteAsset,
  getAllAssets,
} from "#/services/storage/assets";

export const Route = createFileRoute("/")({
  loader: async () => {
    const assets = await getAllAssets();
    const stats = computeStats(assets);
    const activity90d = computeActivity(assets, 90);
    return { assets, stats, activity90d };
  },
  component: Dashboard,
});

function Dashboard() {
  const { assets, stats, activity90d } = Route.useLoaderData();
  const router = useRouter();

  async function handleDelete(id: string) {
    await deleteAsset(id);
    await router.invalidate();
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards stats={stats} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive data={activity90d} />
      </div>
      <DataTable data={assets} onDelete={handleDelete} />
    </div>
  );
}
