import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, DollarSign, Settings, TrendingDown, Users } from "lucide-react";
import * as React from "react";

import { ActiveUsersChart } from "@/components/analytics/active-users-chart";
import { MetricCard } from "@/components/analytics/metric-card";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { TopEventsTable } from "@/components/analytics/top-events-table";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-project";
import { getIntegrationStatus } from "@/services/analytics/integrations";
import {
  fetchActiveUsers,
  fetchTopEvents,
  type MixpanelTopEvent,
} from "@/services/analytics/mixpanel";
import { fetchOverview } from "@/services/analytics/revenuecat";

export const Route = createFileRoute("/$projectSlug/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const project = useProject();
  const [loading, setLoading] = React.useState(true);
  const [integrations, setIntegrations] = React.useState({
    mixpanel: false,
    revenuecat: false,
  });

  // Mixpanel data
  const [activeUsers, setActiveUsers] = React.useState({ dau: 0, wau: 0, mau: 0 });
  const [topEvents, setTopEvents] = React.useState<MixpanelTopEvent[]>([]);

  // RevenueCat data
  const [revenue, setRevenue] = React.useState({
    mrr: 0,
    active_subscribers: 0,
    churn_rate: 0,
    revenue: 0,
  });

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const status = await getIntegrationStatus(project.id);
        if (cancelled) return;
        setIntegrations(status);

        const promises: Promise<void>[] = [];

        if (status.mixpanel) {
          promises.push(
            fetchActiveUsers(project.id).then((data) => {
              if (!cancelled) setActiveUsers(data);
            }),
            fetchTopEvents(project.id).then((data) => {
              if (!cancelled) setTopEvents(data);
            }),
          );
        }

        if (status.revenuecat) {
          promises.push(
            fetchOverview(project.id, project.id).then((data) => {
              if (!cancelled) setRevenue(data);
            }),
          );
        }

        await Promise.allSettled(promises);
      } catch {
        // Integrations not configured — show empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [project.id]);

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
              value={integrations.mixpanel ? activeUsers.dau.toLocaleString() : "—"}
              description={integrations.mixpanel ? "From Mixpanel" : "Connect Mixpanel"}
              icon={<Users className="size-4" />}
              loading={loading}
            />
            <MetricCard
              title="MRR"
              value={integrations.revenuecat ? `$${revenue.mrr.toLocaleString()}` : "—"}
              description={
                integrations.revenuecat ? "From RevenueCat" : "Connect RevenueCat"
              }
              icon={<DollarSign className="size-4" />}
              loading={loading}
            />
            <MetricCard
              title="Churn Rate"
              value={integrations.revenuecat ? `${revenue.churn_rate.toFixed(1)}%` : "—"}
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
                  ? revenue.active_subscribers.toLocaleString()
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
