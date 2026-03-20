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
import {
  getIntegrationStatus,
  type IntegrationProvider,
  saveIntegration,
} from "@/services/analytics/integrations";

export const Route = createFileRoute("/$projectSlug/settings")({
  component: SettingsPage,
});

// ── Types ────────────────────────────────────────────────────────────────────

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  secret?: boolean;
  multiline?: boolean;
  metadataKey?: string;
}

interface CardConfig {
  provider: IntegrationProvider;
  title: string;
  logo: string;
  descriptionText: string;
  helpAction: string;
  helpLink: { href: string; label: string };
  fields: FieldConfig[];
  buildToken: (values: Record<string, string>) => string;
}

// ── Provider configs ─────────────────────────────────────────────────────────

const PROVIDER_LOGO: Record<IntegrationProvider, string> = {
  mixpanel: "https://cdn.simpleicons.org/mixpanel/7856FF",
  revenuecat: "https://cdn.simpleicons.org/revenuecat/F25A5A",
  appstore: "https://cdn.simpleicons.org/appstore/0D96F6",
  playstore: "https://cdn.simpleicons.org/googleplay/414141",
};

const ANALYTICS_CARDS: CardConfig[] = [
  {
    provider: "mixpanel",
    title: "Mixpanel",
    logo: PROVIDER_LOGO.mixpanel,
    descriptionText: "Connect your Mixpanel project to see engagement metrics.",
    helpAction: "Find both values in",
    helpLink: {
      href: "https://mixpanel.com/settings/project",
      label: "Mixpanel Project Settings",
    },
    fields: [
      {
        key: "mpProjectId",
        label: "Project ID",
        placeholder: "e.g. 3978835",
        metadataKey: "mixpanelProjectId",
      },
      {
        key: "apiSecret",
        label: "API Secret",
        placeholder: "Paste your API Secret",
        secret: true,
      },
    ],
    buildToken: (v) =>
      JSON.stringify({
        apiSecret: v.apiSecret,
        mixpanelProjectId: v.mpProjectId,
      }),
  },
  {
    provider: "revenuecat",
    title: "RevenueCat",
    logo: PROVIDER_LOGO.revenuecat,
    descriptionText:
      "Connect RevenueCat to track revenue metrics (MRR, active subscriptions, churn rate).",
    helpAction: "Find your credentials in",
    helpLink: {
      href: "https://app.revenuecat.com/overview",
      label: "RevenueCat Dashboard",
    },
    fields: [
      {
        key: "rcProjectId",
        label: "Project ID",
        placeholder: "e.g. proj1ab2c3d4",
        metadataKey: "rcProjectId",
      },
      {
        key: "apiKey",
        label: "v2 Secret API Key",
        placeholder: "Paste your v2 Secret API key",
        secret: true,
      },
    ],
    buildToken: (v) => JSON.stringify({ apiKey: v.apiKey, rcProjectId: v.rcProjectId }),
  },
];

const STORE_CARDS: CardConfig[] = [
  {
    provider: "appstore",
    title: "App Store Connect",
    logo: PROVIDER_LOGO.appstore,
    descriptionText: "Connect App Store Connect to see iOS ratings and reviews.",
    helpAction: "Create an API key in",
    helpLink: {
      href: "https://appstoreconnect.apple.com/access/integrations/api",
      label: "Users and Access → Integrations",
    },
    fields: [
      {
        key: "bundleId",
        label: "Bundle ID",
        placeholder: "e.g. com.wgsoftwares.wakemind",
        metadataKey: "bundleId",
      },
      {
        key: "issuerId",
        label: "Issuer ID",
        placeholder: "e.g. 57246542-96fe-1a63-e053-0824d011072a",
        metadataKey: "issuerId",
      },
      {
        key: "keyId",
        label: "Key ID",
        placeholder: "e.g. 2X9R4HXF34",
        metadataKey: "keyId",
      },
      {
        key: "privateKey",
        label: "Private Key (.p8)",
        placeholder: "Paste the contents of your .p8 file",
        secret: true,
        multiline: true,
      },
    ],
    buildToken: (v) =>
      JSON.stringify({
        issuerId: v.issuerId,
        keyId: v.keyId,
        privateKey: v.privateKey,
      }),
  },
  {
    provider: "playstore",
    title: "Google Play Console",
    logo: PROVIDER_LOGO.playstore,
    descriptionText: "Connect Google Play to see Android ratings and reviews.",
    helpAction: "Create a Service Account in",
    helpLink: {
      href: "https://play.google.com/console/developers",
      label: "Google Play Console → API Access",
    },
    fields: [
      {
        key: "packageName",
        label: "Package Name",
        placeholder: "e.g. com.wgsoftwares.wakemind",
        metadataKey: "packageName",
      },
      {
        key: "serviceAccountJson",
        label: "Service Account JSON",
        placeholder: 'Paste your service account JSON ({"type":"service_account",...})',
        secret: true,
        multiline: true,
      },
    ],
    buildToken: (v) => v.serviceAccountJson,
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

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

        {ANALYTICS_CARDS.map((c) => (
          <IntegrationCard key={c.provider} config={c} projectId={project.id} />
        ))}

        <Separator />

        <div>
          <h2 className="text-lg font-semibold tracking-tight">App Stores</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Connect your app store accounts to see ratings and reviews.
          </p>
        </div>

        {STORE_CARDS.map((c) => (
          <IntegrationCard key={c.provider} config={c} projectId={project.id} />
        ))}
      </div>
    </div>
  );
}

// ── Generic integration card ─────────────────────────────────────────────────

function ConnectedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <Check className="size-3" />
      Connected
    </span>
  );
}

function IntegrationCard({
  config,
  projectId,
}: {
  config: CardConfig;
  projectId: string;
}) {
  const [values, setValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(config.fields.map((f) => [f.key, ""])),
  );
  const [showSecrets, setShowSecrets] = React.useState<Record<string, boolean>>({});

  const { data: status, isLoading } = useQuery({
    queryKey: ["integrations", projectId],
    queryFn: () => getIntegrationStatus(projectId),
  });

  const info = status?.[config.provider];
  const connected = info?.connected ?? false;

  // Hydrate metadata fields from saved values
  const metadata = info?.metadata;
  React.useEffect(() => {
    if (!metadata) return;
    setValues((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const field of config.fields) {
        if (field.metadataKey && metadata[field.metadataKey] && !prev[field.key]) {
          next[field.key] = metadata[field.metadataKey];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const trimmed: Record<string, string> = {};
      for (const [k, v] of Object.entries(values)) trimmed[k] = v.trim();

      const token = config.buildToken(trimmed);
      const meta: Record<string, string> = {};
      for (const field of config.fields) {
        if (field.metadataKey) meta[field.metadataKey] = trimmed[field.key];
      }
      return saveIntegration(projectId, config.provider, token, meta);
    },
    onSuccess: () => {
      // Clear secret fields only
      setValues((prev) => {
        const next = { ...prev };
        for (const field of config.fields) {
          if (field.secret) next[field.key] = "";
        }
        return next;
      });
      toast.success(`${config.title} connected successfully`);
      queryClient.invalidateQueries({ queryKey: ["integrations", projectId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save integration");
    },
  });

  const canSubmit =
    config.fields.every((f) => values[f.key]?.trim()) && !saveMutation.isPending;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <img src={config.logo} alt={`${config.title} logo`} className="size-5" />
          {config.title}
          {connected && <ConnectedBadge />}
        </CardTitle>
        <CardDescription>
          {config.descriptionText} {config.helpAction}{" "}
          <a
            href={config.helpLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {config.helpLink.label}
          </a>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoading && (
          <div className="flex flex-col gap-3">
            {config.fields.map((field) => (
              <div key={field.key}>
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {field.label}
                </span>
                {field.secret ? (
                  <SecretField
                    field={field}
                    value={values[field.key]}
                    show={showSecrets[field.key] ?? false}
                    connected={connected}
                    onChange={(v) => setValues((prev) => ({ ...prev, [field.key]: v }))}
                    onToggle={() =>
                      setShowSecrets((prev) => ({
                        ...prev,
                        [field.key]: !prev[field.key],
                      }))
                    }
                  />
                ) : (
                  <Input
                    placeholder={field.placeholder}
                    value={values[field.key]}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                  />
                )}
              </div>
            ))}
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!canSubmit}
              className="self-end"
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

// ── Secret field (input or textarea with visibility toggle) ──────────────────

function SecretField({
  field,
  value,
  show,
  connected,
  onChange,
  onToggle,
}: {
  field: FieldConfig;
  value: string;
  show: boolean;
  connected: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  const placeholder = connected ? "••••••••••••" : field.placeholder;
  const toggleButton = (
    <button
      type="button"
      onClick={onToggle}
      className={`absolute text-muted-foreground hover:text-foreground ${
        field.multiline ? "top-2 right-3" : "top-1/2 right-3 -translate-y-1/2"
      }`}
    >
      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );

  if (field.multiline) {
    return (
      <div className="relative">
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          style={
            !show && value
              ? { color: "transparent", textShadow: "0 0 8px rgba(0,0,0,0.5)" }
              : undefined
          }
        />
        {toggleButton}
      </div>
    );
  }

  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
      />
      {toggleButton}
    </div>
  );
}
