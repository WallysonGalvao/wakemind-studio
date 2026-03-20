import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Eye, EyeOff, Loader2, UserCircle } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/configs/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useProject } from "@/hooks/use-project";
import { getIntegrationStatus, saveIntegration } from "@/services/analytics/integrations";

export const Route = createFileRoute("/$projectSlug/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const project = useProject();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage preferences for <span className="font-medium">{project.name}</span>.
        </p>
      </div>

      <div className="flex max-w-xl flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle className="size-4" />
              Account
            </CardTitle>
            <CardDescription>
              Signed in as{" "}
              <span className="font-medium text-foreground">{user?.email}</span>. Image
              generation is powered by OpenAI via the Fenrir backend.
            </CardDescription>
          </CardHeader>
        </Card>

        <IntegrationCard
          projectId={project.id}
          provider="mixpanel"
          title="Mixpanel"
          description="Connect your Mixpanel project to see engagement metrics (DAU/WAU/MAU, top events, retention)."
          placeholder="Enter your Mixpanel API Secret"
        />

        <IntegrationCard
          projectId={project.id}
          provider="revenuecat"
          title="RevenueCat"
          description="Connect RevenueCat to track revenue metrics (MRR, active subscriptions, churn rate)."
          placeholder="Enter your RevenueCat v2 API key"
        />
      </div>
    </div>
  );
}

function IntegrationCard({
  projectId,
  provider,
  title,
  description,
  placeholder,
}: {
  projectId: string;
  provider: "mixpanel" | "revenuecat";
  title: string;
  description: string;
  placeholder: string;
}) {
  const [token, setToken] = React.useState("");
  const [showToken, setShowToken] = React.useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ["integrations", projectId],
    queryFn: () => getIntegrationStatus(projectId),
  });

  const connected = status?.[provider] ?? false;

  const saveMutation = useMutation({
    mutationFn: () => saveIntegration(projectId, provider, token.trim()),
    onSuccess: () => {
      setToken("");
      toast.success(`${title} connected successfully`);
      queryClient.invalidateQueries({ queryKey: ["integrations", projectId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save integration");
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {title}
          {connected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Check className="size-3" />
              Connected
            </span>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoading && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showToken ? "text" : "password"}
                placeholder={connected ? "••••••••••••" : placeholder}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !token.trim()}
            >
              {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {connected ? "Update" : "Connect"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
