import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  DollarSign,
  MessageSquare,
  Settings,
  Star,
  TrendingDown,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { ActiveUsersChart } from "@/components/analytics/active-users-chart";
import { MetricCard } from "@/components/analytics/metric-card";
import { RatingsBreakdown } from "@/components/analytics/ratings-breakdown";
import { RetentionHeatmap } from "@/components/analytics/retention-heatmap";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { ReviewsFeed } from "@/components/analytics/reviews-feed";
import { TopEventsTable } from "@/components/analytics/top-events-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useProject } from "@/hooks/use-project";
import {
  fetchAppStoreRatings,
  fetchAppStoreReviews,
} from "@/services/analytics/appstore";
import { getIntegrationStatus } from "@/services/analytics/integrations";
import {
  fetchActiveUsers,
  fetchRetention,
  fetchTopEvents,
} from "@/services/analytics/mixpanel";
import {
  fetchPlayStoreRatings,
  fetchPlayStoreReviews,
} from "@/services/analytics/playstore";
import { fetchOverview } from "@/services/analytics/revenuecat";

export const Route = createFileRoute("/$projectSlug/analytics")({
  component: AnalyticsPage,
});

// Analytics data changes slowly — cache for 10 min, keep in memory for 30 min
const ANALYTICS_QUERY_OPTS = {
  staleTime: 1000 * 60 * 10,
  gcTime: 1000 * 60 * 30,
} as const;

function AnalyticsPage() {
  const { t } = useTranslation();
  const project = useProject();

  const { data: integrations, isLoading: intLoading } = useQuery({
    queryKey: ["integrations", project.id],
    queryFn: () => getIntegrationStatus(project.id),
    initialData: {
      mixpanel: { connected: false, metadata: {} },
      revenuecat: { connected: false, metadata: {} },
      appstore: { connected: false, metadata: {} },
      playstore: { connected: false, metadata: {} },
    },
  });

  const { data: activeUsers, isLoading: mpUsersLoading } = useQuery({
    queryKey: ["mixpanel", "activeUsers", project.id],
    queryFn: () => fetchActiveUsers(project.id),
    enabled: integrations.mixpanel.connected,
    ...ANALYTICS_QUERY_OPTS,
  });

  const { data: topEvents = [], isLoading: mpEventsLoading } = useQuery({
    queryKey: ["mixpanel", "topEvents", project.id],
    queryFn: () => fetchTopEvents(project.id),
    enabled: integrations.mixpanel.connected,
    ...ANALYTICS_QUERY_OPTS,
  });

  const { data: retention = [], isLoading: mpRetentionLoading } = useQuery({
    queryKey: ["mixpanel", "retention", project.id],
    queryFn: () => {
      const to = new Date();
      const from = new Date(to);
      from.setDate(from.getDate() - 56);
      return fetchRetention(
        project.id,
        from.toISOString().slice(0, 10),
        to.toISOString().slice(0, 10),
      );
    },
    enabled: integrations.mixpanel.connected,
    ...ANALYTICS_QUERY_OPTS,
  });

  const { data: revenue, isLoading: rcLoading } = useQuery({
    queryKey: ["revenuecat", "overview", project.id],
    queryFn: () => fetchOverview(project.id),
    enabled: integrations.revenuecat.connected,
    ...ANALYTICS_QUERY_OPTS,
  });

  // ── Store queries ────────────────────────────────────────────────────
  const { data: iosRatings, isLoading: iosRatingsLoading } = useQuery({
    queryKey: ["appstore", "ratings", project.id],
    queryFn: () => fetchAppStoreRatings(project.id),
    enabled: integrations.appstore.connected,
    ...ANALYTICS_QUERY_OPTS,
  });

  const { data: iosReviews = [], isLoading: iosReviewsLoading } = useQuery({
    queryKey: ["appstore", "reviews", project.id],
    queryFn: () => fetchAppStoreReviews(project.id),
    enabled: integrations.appstore.connected,
    ...ANALYTICS_QUERY_OPTS,
  });

  const { data: androidRatings, isLoading: androidRatingsLoading } = useQuery({
    queryKey: ["playstore", "ratings", project.id],
    queryFn: () => fetchPlayStoreRatings(project.id),
    enabled: integrations.playstore.connected,
    ...ANALYTICS_QUERY_OPTS,
  });

  const { data: androidReviews = [], isLoading: androidReviewsLoading } = useQuery({
    queryKey: ["playstore", "reviews", project.id],
    queryFn: () => fetchPlayStoreReviews(project.id),
    enabled: integrations.playstore.connected,
    ...ANALYTICS_QUERY_OPTS,
  });

  const loading =
    intLoading ||
    mpUsersLoading ||
    mpEventsLoading ||
    mpRetentionLoading ||
    rcLoading ||
    iosRatingsLoading ||
    iosReviewsLoading ||
    androidRatingsLoading ||
    androidReviewsLoading;
  const hasAny =
    integrations.mixpanel.connected ||
    integrations.revenuecat.connected ||
    integrations.appstore.connected ||
    integrations.playstore.connected;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("pages.analytics.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("pages.analytics.metricsFor")}{" "}
            <span className="font-medium">{project.name}</span>.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/$projectSlug/settings" params={{ projectSlug: project.slug }}>
            <Settings className="size-4" />
            {t("pages.analytics.integrations")}
          </Link>
        </Button>
      </div>

      {!hasAny && !loading ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Activity className="mb-4 size-10 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold">{t("pages.analytics.emptyTitle")}</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {t("pages.analytics.emptyDescription")}
          </p>
          <Button className="mt-4" asChild>
            <Link to="/$projectSlug/settings" params={{ projectSlug: project.slug }}>
              <Settings className="size-4" />
              {t("pages.analytics.configureIntegrations")}
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title={t("pages.analytics.kpis.dau")}
              value={
                integrations.mixpanel.connected
                  ? (activeUsers?.dau ?? 0).toLocaleString()
                  : "—"
              }
              description={
                integrations.mixpanel.connected
                  ? t("pages.analytics.kpis.fromMixpanel")
                  : t("pages.analytics.kpis.connectMixpanel")
              }
              icon={<Users className="size-4" />}
              loading={loading}
            />
            <MetricCard
              title={t("pages.analytics.kpis.mrr")}
              value={
                integrations.revenuecat.connected
                  ? `$${(revenue?.mrr ?? 0).toLocaleString()}`
                  : "—"
              }
              description={
                integrations.revenuecat.connected
                  ? t("pages.analytics.kpis.fromRevenuecat")
                  : t("pages.analytics.kpis.connectRevenuecat")
              }
              icon={<DollarSign className="size-4" />}
              loading={loading}
            />
            <MetricCard
              title={t("pages.analytics.kpis.churnRate")}
              value={
                integrations.revenuecat.connected
                  ? `${(revenue?.churn_rate ?? 0).toFixed(1)}%`
                  : "—"
              }
              description={
                integrations.revenuecat.connected
                  ? t("pages.analytics.kpis.fromRevenuecat")
                  : t("pages.analytics.kpis.connectRevenuecat")
              }
              icon={<TrendingDown className="size-4" />}
              loading={loading}
            />
            <MetricCard
              title={t("pages.analytics.kpis.activeSubscriptions")}
              value={
                integrations.revenuecat.connected
                  ? (revenue?.active_subscribers ?? 0).toLocaleString()
                  : "—"
              }
              description={
                integrations.revenuecat.connected
                  ? t("pages.analytics.kpis.fromRevenuecat")
                  : t("pages.analytics.kpis.connectRevenuecat")
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
          {integrations.mixpanel.connected && (
            <TopEventsTable events={topEvents} loading={loading} />
          )}

          {/* Retention Heatmap */}
          {integrations.mixpanel.connected && (
            <RetentionHeatmap data={retention} loading={loading} />
          )}

          {/* ── Stores Section ──────────────────────────────────────── */}
          {(integrations.appstore.connected || integrations.playstore.connected) && (
            <>
              <Separator />

              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {t("pages.analytics.stores.title")}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {t("pages.analytics.stores.description")}
                </p>
              </div>

              {/* Store KPI Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title={t("pages.analytics.stores.iosRating")}
                  value={
                    integrations.appstore.connected
                      ? `${iosRatings?.average ?? "—"} ★`
                      : "—"
                  }
                  description={
                    integrations.appstore.connected
                      ? t("pages.analytics.stores.ratings", {
                          count: iosRatings?.total ?? 0,
                        })
                      : t("pages.analytics.stores.connectAppStore")
                  }
                  icon={<Star className="size-4" />}
                  loading={loading}
                />
                <MetricCard
                  title={t("pages.analytics.stores.androidRating")}
                  value={
                    integrations.playstore.connected
                      ? `${androidRatings?.average ?? "—"} ★`
                      : "—"
                  }
                  description={
                    integrations.playstore.connected
                      ? t("pages.analytics.stores.ratings", {
                          count: androidRatings?.total ?? 0,
                        })
                      : t("pages.analytics.stores.connectGooglePlay")
                  }
                  icon={<Star className="size-4" />}
                  loading={loading}
                />
                <MetricCard
                  title={t("pages.analytics.stores.iosReviews")}
                  value={
                    integrations.appstore.connected
                      ? iosReviews.length.toLocaleString()
                      : "—"
                  }
                  description={
                    integrations.appstore.connected
                      ? t("pages.analytics.stores.recentReviews")
                      : t("pages.analytics.stores.connectAppStore")
                  }
                  icon={<MessageSquare className="size-4" />}
                  loading={loading}
                />
                <MetricCard
                  title={t("pages.analytics.stores.androidReviews")}
                  value={
                    integrations.playstore.connected
                      ? androidReviews.length.toLocaleString()
                      : "—"
                  }
                  description={
                    integrations.playstore.connected
                      ? t("pages.analytics.stores.recentReviews")
                      : t("pages.analytics.stores.connectGooglePlay")
                  }
                  icon={<MessageSquare className="size-4" />}
                  loading={loading}
                />
              </div>

              {/* Ratings & Reviews */}
              <div className="grid gap-4 lg:grid-cols-2">
                <RatingsBreakdown
                  ios={iosRatings?.distribution ?? null}
                  android={androidRatings?.distribution ?? null}
                  loading={loading}
                />
                <ReviewsFeed
                  iosReviews={iosReviews}
                  androidReviews={androidReviews}
                  loading={loading}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
