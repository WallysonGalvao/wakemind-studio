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
import { Separator } from "@/components/ui/separator";
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

        <MixpanelCard projectId={project.id} />

        <RevenueCatCard projectId={project.id} />

        <Separator />

        <div>
          <h2 className="text-lg font-semibold tracking-tight">App Stores</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Connect your app store accounts to see ratings and reviews.
          </p>
        </div>

        <AppStoreCard projectId={project.id} />

        <PlayStoreCard projectId={project.id} />
      </div>
    </div>
  );
}

const PROVIDER_LOGO: Record<string, string> = {
  mixpanel: "https://cdn.simpleicons.org/mixpanel/7856FF",
  revenuecat: "https://cdn.simpleicons.org/revenuecat/F25A5A",
  appstore: "https://cdn.simpleicons.org/appstore/0D96F6",
  playstore: "https://cdn.simpleicons.org/googleplay/414141",
};

function MixpanelCard({ projectId }: { projectId: string }) {
  const [mpProjectId, setMpProjectId] = React.useState("");
  const [apiSecret, setApiSecret] = React.useState("");
  const [showSecret, setShowSecret] = React.useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ["integrations", projectId],
    queryFn: () => getIntegrationStatus(projectId),
  });

  const info = status?.mixpanel;
  const connected = info?.connected ?? false;

  const savedMpProjectId = info?.metadata?.mixpanelProjectId;
  React.useEffect(() => {
    if (savedMpProjectId && !mpProjectId) {
      setMpProjectId(savedMpProjectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedMpProjectId]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const token = JSON.stringify({
        apiSecret: apiSecret.trim(),
        mixpanelProjectId: mpProjectId.trim(),
      });
      return saveIntegration(projectId, "mixpanel", token, {
        mixpanelProjectId: mpProjectId.trim(),
      });
    },
    onSuccess: () => {
      setApiSecret("");
      toast.success("Mixpanel connected successfully");
      queryClient.invalidateQueries({ queryKey: ["integrations", projectId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save integration");
    },
  });

  function handleSave() {
    saveMutation.mutate();
  }

  const canSubmit = mpProjectId.trim() && apiSecret.trim() && !saveMutation.isPending;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <img src={PROVIDER_LOGO.mixpanel} alt="Mixpanel logo" className="size-5" />
          Mixpanel
          {connected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Check className="size-3" />
              Connected
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Connect your Mixpanel project to see engagement metrics. Find both values in{" "}
          <a
            href="https://mixpanel.com/settings/project"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Mixpanel Project Settings
          </a>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoading && (
          <div className="flex flex-col gap-3">
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Project ID
              </span>
              <Input
                placeholder="e.g. 3978835"
                value={mpProjectId}
                onChange={(e) => setMpProjectId(e.target.value)}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                API Secret
              </span>
              <div className="relative">
                <Input
                  type={showSecret ? "text" : "password"}
                  placeholder={connected ? "••••••••••••" : "Paste your API Secret"}
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecret ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>
            <Button onClick={handleSave} disabled={!canSubmit} className="self-end">
              {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {connected ? "Update" : "Connect"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RevenueCatCard({ projectId }: { projectId: string }) {
  const [rcProjectId, setRcProjectId] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");
  const [showKey, setShowKey] = React.useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ["integrations", projectId],
    queryFn: () => getIntegrationStatus(projectId),
  });

  const info = status?.revenuecat;
  const connected = info?.connected ?? false;

  const savedRcProjectId = info?.metadata?.rcProjectId;
  React.useEffect(() => {
    if (savedRcProjectId && !rcProjectId) {
      setRcProjectId(savedRcProjectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedRcProjectId]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const token = JSON.stringify({
        apiKey: apiKey.trim(),
        rcProjectId: rcProjectId.trim(),
      });
      return saveIntegration(projectId, "revenuecat", token, {
        rcProjectId: rcProjectId.trim(),
      });
    },
    onSuccess: () => {
      setApiKey("");
      toast.success("RevenueCat connected successfully");
      queryClient.invalidateQueries({ queryKey: ["integrations", projectId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save integration");
    },
  });

  function handleSave() {
    saveMutation.mutate();
  }

  const canSubmit = rcProjectId.trim() && apiKey.trim() && !saveMutation.isPending;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <img src={PROVIDER_LOGO.revenuecat} alt="RevenueCat logo" className="size-5" />
          RevenueCat
          {connected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Check className="size-3" />
              Connected
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Connect RevenueCat to track revenue metrics (MRR, active subscriptions, churn
          rate). Find your credentials in{" "}
          <a
            href="https://app.revenuecat.com/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            RevenueCat Dashboard
          </a>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoading && (
          <div className="flex flex-col gap-3">
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Project ID
              </span>
              <Input
                placeholder="e.g. proj1ab2c3d4"
                value={rcProjectId}
                onChange={(e) => setRcProjectId(e.target.value)}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                v2 Secret API Key
              </span>
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder={
                    connected ? "••••••••••••" : "Paste your v2 Secret API key"
                  }
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button onClick={handleSave} disabled={!canSubmit} className="self-end">
              {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {connected ? "Update" : "Connect"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AppStoreCard({ projectId }: { projectId: string }) {
  const [bundleId, setBundleId] = React.useState("");
  const [issuerId, setIssuerId] = React.useState("");
  const [keyId, setKeyId] = React.useState("");
  const [privateKey, setPrivateKey] = React.useState("");
  const [showKey, setShowKey] = React.useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ["integrations", projectId],
    queryFn: () => getIntegrationStatus(projectId),
  });

  const info = status?.appstore;
  const connected = info?.connected ?? false;

  const savedBundleId = info?.metadata?.bundleId;
  const savedIssuerId = info?.metadata?.issuerId;
  const savedKeyId = info?.metadata?.keyId;
  React.useEffect(() => {
    if (savedBundleId && !bundleId) setBundleId(savedBundleId);
    if (savedIssuerId && !issuerId) setIssuerId(savedIssuerId);
    if (savedKeyId && !keyId) setKeyId(savedKeyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedBundleId, savedIssuerId, savedKeyId]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const token = JSON.stringify({
        issuerId: issuerId.trim(),
        keyId: keyId.trim(),
        privateKey: privateKey.trim(),
      });
      return saveIntegration(projectId, "appstore", token, {
        bundleId: bundleId.trim(),
        issuerId: issuerId.trim(),
        keyId: keyId.trim(),
      });
    },
    onSuccess: () => {
      setPrivateKey("");
      toast.success("App Store Connect connected successfully");
      queryClient.invalidateQueries({ queryKey: ["integrations", projectId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save integration");
    },
  });

  function handleSave() {
    saveMutation.mutate();
  }

  const canSubmit =
    bundleId.trim() &&
    issuerId.trim() &&
    keyId.trim() &&
    privateKey.trim() &&
    !saveMutation.isPending;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <img src={PROVIDER_LOGO.appstore} alt="App Store logo" className="size-5" />
          App Store Connect
          {connected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Check className="size-3" />
              Connected
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Connect App Store Connect to see iOS ratings and reviews. Create an API key in{" "}
          <a
            href="https://appstoreconnect.apple.com/access/integrations/api"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Users and Access → Integrations
          </a>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoading && (
          <div className="flex flex-col gap-3">
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Bundle ID
              </span>
              <Input
                placeholder="e.g. com.wgsoftwares.wakemind"
                value={bundleId}
                onChange={(e) => setBundleId(e.target.value)}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Issuer ID
              </span>
              <Input
                placeholder="e.g. 57246542-96fe-1a63-e053-0824d011072a"
                value={issuerId}
                onChange={(e) => setIssuerId(e.target.value)}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Key ID
              </span>
              <Input
                placeholder="e.g. 2X9R4HXF34"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Private Key (.p8)
              </span>
              <div className="relative">
                <textarea
                  placeholder={
                    connected ? "••••••••••••" : "Paste the contents of your .p8 file"
                  }
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  style={
                    !showKey && privateKey
                      ? {
                          color: "transparent",
                          textShadow: "0 0 8px rgba(0,0,0,0.5)",
                        }
                      : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute top-2 right-3 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button onClick={handleSave} disabled={!canSubmit} className="self-end">
              {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {connected ? "Update" : "Connect"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PlayStoreCard({ projectId }: { projectId: string }) {
  const [packageName, setPackageName] = React.useState("");
  const [serviceAccountJson, setServiceAccountJson] = React.useState("");
  const [showJson, setShowJson] = React.useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ["integrations", projectId],
    queryFn: () => getIntegrationStatus(projectId),
  });

  const info = status?.playstore;
  const connected = info?.connected ?? false;

  const savedPackageName = info?.metadata?.packageName;
  React.useEffect(() => {
    if (savedPackageName && !packageName) setPackageName(savedPackageName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPackageName]);

  const saveMutation = useMutation({
    mutationFn: () => {
      return saveIntegration(projectId, "playstore", serviceAccountJson.trim(), {
        packageName: packageName.trim(),
      });
    },
    onSuccess: () => {
      setServiceAccountJson("");
      toast.success("Google Play connected successfully");
      queryClient.invalidateQueries({ queryKey: ["integrations", projectId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save integration");
    },
  });

  function handleSave() {
    saveMutation.mutate();
  }

  const canSubmit =
    packageName.trim() && serviceAccountJson.trim() && !saveMutation.isPending;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <img src={PROVIDER_LOGO.playstore} alt="Google Play logo" className="size-5" />
          Google Play Console
          {connected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Check className="size-3" />
              Connected
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Connect Google Play to see Android ratings and reviews. Create a Service Account
          in{" "}
          <a
            href="https://play.google.com/console/developers"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Google Play Console → API Access
          </a>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoading && (
          <div className="flex flex-col gap-3">
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Package Name
              </span>
              <Input
                placeholder="e.g. com.wgsoftwares.wakemind"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Service Account JSON
              </span>
              <div className="relative">
                <textarea
                  placeholder={
                    connected
                      ? "••••••••••••"
                      : 'Paste your service account JSON ({"type":"service_account",...})'
                  }
                  value={serviceAccountJson}
                  onChange={(e) => setServiceAccountJson(e.target.value)}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  style={
                    !showJson && serviceAccountJson
                      ? {
                          color: "transparent",
                          textShadow: "0 0 8px rgba(0,0,0,0.5)",
                        }
                      : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowJson(!showJson)}
                  className="absolute top-2 right-3 text-muted-foreground hover:text-foreground"
                >
                  {showJson ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button onClick={handleSave} disabled={!canSubmit} className="self-end">
              {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {connected ? "Update" : "Connect"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
