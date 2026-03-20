import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, DollarSign, Settings, TrendingDown, Users } from "lucide-react";

import { ActiveUsersChart } from "@/components/analytics/active-users-chart";
import { MetricCard } from "@/components/analytics/metric-card";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { TopEventsTable } from "@/components/analytics/top-events-table";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-project";
import { getIntegrationStatus } from "@/services/analytics/integrations";
import { fetchActiveUsers, fetchTopEvents } from "@/services/analytics/mixpanel";
import { fetchOverview } from "@/services/analytics/revenuecat";

export const Route = createFileRoute("/$projectSlug/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const project = useProject();

  const { data: integrations, isLoading: intLoading } = useQuery({
    queryKey: ["integrations", project.id],
    queryFn: () => getIntegrationStatus(project.id),
    initialData: { mixpanel: false, revenuecat: false },
  });

  const { data: activeUsers, isLoading: mpUsersLoading } = useQuery({
    queryKey: ["mixpanel", "activeUsers", project.id],
    queryFn: () => fetchActiveUsers(project.id),
    enabled: integrations.mixpanel,
  });

  const { data: topEvents = [], isLoading: mpEventsLoading } = useQuery({
    queryKey: ["mixpanel", "topEvents", project.id],
    queryFn: () => fetchTopEvents(project.id),
    enabled: integrations.mixpanel,
  });

  const { data: revenue, isLoading: rcLoading } = useQuery({
    queryKey: ["revenuecat", "overview", project.id],
    queryFn: () => fetchOverview(project.id, project.id),
    enabled: integrations.revenuecat,
  });

  const loading = intLoading || mpUsersLoading || mpEventsLoading || rcLoading;
  const hasAny = integrations.mixpanel || integrations.revenuecat;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Metrics for <span className="font-medium">{project.name}</span>.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/$projectSlug/settings" params={{ projectSlug: project.slug }}>
            <Settings className="size-4" />
            Integrations
          </Link>
        </Button>
      </div>

      {!hasAny && !loading ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Activity className="mb-4 size-10 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold">No integrations connected</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Connect Mixpanel and/or RevenueCat in project settings to see live analytics
            data.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/$projectSlug/settings" params={{ projectSlug: project.slug }}>
              <Settings className="size-4" />
              Configure Integrations
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Daily Active Users"
              value={
                integrations.mixpanel ? (activeUsers?.dau ?? 0).toLocaleString() : "—"
              }
              description={integrations.mixpanel ? "From Mixpanel" : "Connect Mixpanel"}
              icon={<Users className="size-4" />}
              loading={loading}
            />
            <MetricCard
              title="MRR"
              value={
                integrations.revenuecat ? `$${(revenue?.mrr ?? 0).toLocaleString()}` : "—"
              }
              description={
                integrations.revenuecat ? "From RevenueCat" : "Connect RevenueCat"
              }
              icon={<DollarSign className="size-4" />}
              loading={loading}
            />
            <MetricCard
              title="Churn Rate"
              value={
                integrations.revenuecat
                  ? `${(revenue?.churn_rate ?? 0).toFixed(1)}%`
                  : "—"
              }
              description={
                integrations.revenuecat ? "From RevenueCat" : "Connect RevenueCat"
              }
              icon={<TrendingDown className="size-4" />}
              loading={loading}
            />
            <MetricCard
              title="Active Subscriptions"
              value={
                integrations.revenuecat
                  ? (revenue?.active_subscribers ?? 0).toLocaleString()
                  : "—"
              }
              description={
                integrations.revenuecat ? "From RevenueCat" : "Connect RevenueCat"
              }
              icon={<Activity className="size-4" />}
              loading={loading}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ActiveUsersChart data={[]} loading={loading} />
            <RevenueChart data={[]} loading={loading} />
          </div>

          {/* Top Events */}
          {integrations.mixpanel && (
            <TopEventsTable events={topEvents} loading={loading} />
          )}
        </>
      )}
    </div>
  );
}
