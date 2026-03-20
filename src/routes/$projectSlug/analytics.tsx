import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProject } from "@/hooks/use-project";

export const Route = createFileRoute("/$projectSlug/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const project = useProject();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Metrics for <span className="font-medium">{project.name}</span>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["Active Users", "MRR", "Churn Rate", "Active Subscriptions"].map((metric) => (
          <Card key={metric}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <BarChart3 className="size-4 text-muted-foreground" />
                {metric}
              </CardTitle>
              <CardDescription>Mixpanel / RevenueCat</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-muted-foreground/50">—</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Connect integrations in Settings to see data
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
