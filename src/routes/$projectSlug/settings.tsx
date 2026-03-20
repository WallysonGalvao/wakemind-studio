import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Eye, EyeOff, GitBranch, Loader2, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
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
import { useProject } from "@/hooks/use-project";
import {
  getIntegrationStatus,
  type IntegrationProvider,
  saveIntegration,
} from "@/services/analytics/integrations";
import { updateProjectRepositories } from "@/services/supabase/projects";
import type { Project, ProjectRepository } from "@/types/project";

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

// Card configs are built inside the component to access t()
function useCardConfigs() {
  const { t } = useTranslation();

  const analyticsCards: CardConfig[] = [
    {
      provider: "mixpanel",
      title: t("pages.settings.providers.mixpanel.title"),
      logo: PROVIDER_LOGO.mixpanel,
      descriptionText: t("pages.settings.providers.mixpanel.description"),
      helpAction: t("pages.settings.providers.mixpanel.helpAction"),
      helpLink: {
        href: "https://mixpanel.com/settings/project",
        label: t("pages.settings.providers.mixpanel.helpLink"),
      },
      fields: [
        {
          key: "mpProjectId",
          label: t("pages.settings.providers.mixpanel.fields.projectId"),
          placeholder: t("pages.settings.providers.mixpanel.fields.projectIdPlaceholder"),
          metadataKey: "mixpanelProjectId",
        },
        {
          key: "apiSecret",
          label: t("pages.settings.providers.mixpanel.fields.apiSecret"),
          placeholder: t("pages.settings.providers.mixpanel.fields.apiSecretPlaceholder"),
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
      title: t("pages.settings.providers.revenuecat.title"),
      logo: PROVIDER_LOGO.revenuecat,
      descriptionText: t("pages.settings.providers.revenuecat.description"),
      helpAction: t("pages.settings.providers.revenuecat.helpAction"),
      helpLink: {
        href: "https://app.revenuecat.com/overview",
        label: t("pages.settings.providers.revenuecat.helpLink"),
      },
      fields: [
        {
          key: "rcProjectId",
          label: t("pages.settings.providers.revenuecat.fields.projectId"),
          placeholder: t(
            "pages.settings.providers.revenuecat.fields.projectIdPlaceholder",
          ),
          metadataKey: "rcProjectId",
        },
        {
          key: "apiKey",
          label: t("pages.settings.providers.revenuecat.fields.apiKey"),
          placeholder: t("pages.settings.providers.revenuecat.fields.apiKeyPlaceholder"),
          secret: true,
        },
      ],
      buildToken: (v) => JSON.stringify({ apiKey: v.apiKey, rcProjectId: v.rcProjectId }),
    },
  ];

  const storeCards: CardConfig[] = [
    {
      provider: "appstore",
      title: t("pages.settings.providers.appstore.title"),
      logo: PROVIDER_LOGO.appstore,
      descriptionText: t("pages.settings.providers.appstore.description"),
      helpAction: t("pages.settings.providers.appstore.helpAction"),
      helpLink: {
        href: "https://appstoreconnect.apple.com/access/integrations/api",
        label: t("pages.settings.providers.appstore.helpLink"),
      },
      fields: [
        {
          key: "bundleId",
          label: t("pages.settings.providers.appstore.fields.bundleId"),
          placeholder: t("pages.settings.providers.appstore.fields.bundleIdPlaceholder"),
          metadataKey: "bundleId",
        },
        {
          key: "issuerId",
          label: t("pages.settings.providers.appstore.fields.issuerId"),
          placeholder: t("pages.settings.providers.appstore.fields.issuerIdPlaceholder"),
          metadataKey: "issuerId",
        },
        {
          key: "keyId",
          label: t("pages.settings.providers.appstore.fields.keyId"),
          placeholder: t("pages.settings.providers.appstore.fields.keyIdPlaceholder"),
          metadataKey: "keyId",
        },
        {
          key: "privateKey",
          label: t("pages.settings.providers.appstore.fields.privateKey"),
          placeholder: t(
            "pages.settings.providers.appstore.fields.privateKeyPlaceholder",
          ),
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
      title: t("pages.settings.providers.playstore.title"),
      logo: PROVIDER_LOGO.playstore,
      descriptionText: t("pages.settings.providers.playstore.description"),
      helpAction: t("pages.settings.providers.playstore.helpAction"),
      helpLink: {
        href: "https://play.google.com/console/developers",
        label: t("pages.settings.providers.playstore.helpLink"),
      },
      fields: [
        {
          key: "packageName",
          label: t("pages.settings.providers.playstore.fields.packageName"),
          placeholder: t(
            "pages.settings.providers.playstore.fields.packageNamePlaceholder",
          ),
          metadataKey: "packageName",
        },
        {
          key: "serviceAccountJson",
          label: t("pages.settings.providers.playstore.fields.serviceAccountJson"),
          placeholder: t(
            "pages.settings.providers.playstore.fields.serviceAccountJsonPlaceholder",
          ),
          secret: true,
          multiline: true,
        },
      ],
      buildToken: (v) => v.serviceAccountJson,
    },
  ];

  return { analyticsCards, storeCards };
}

// ── Page ─────────────────────────────────────────────────────────────────────

function SettingsPage() {
  const { t } = useTranslation();
  const project = useProject();
  const { analyticsCards, storeCards } = useCardConfigs();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("pages.settings.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("pages.settings.subtitle")}{" "}
          <span className="font-medium">{project.name}</span>.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <RepositoriesCard project={project} />

        <div className="grid gap-4 md:grid-cols-2">
          {analyticsCards.map((c) => (
            <IntegrationCard key={c.provider} config={c} projectId={project.id} />
          ))}
        </div>

        <Separator />

        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {t("pages.settings.appStores.title")}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("pages.settings.appStores.description")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {storeCards.map((c) => (
            <IntegrationCard key={c.provider} config={c} projectId={project.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Repositories card ────────────────────────────────────────────────────────

function RepositoriesCard({ project }: { project: Project }) {
  const { t } = useTranslation();
  const [repos, setRepos] = React.useState<ProjectRepository[]>(
    project.repositories ?? [],
  );

  const saveMutation = useMutation({
    mutationFn: () => {
      const cleaned = repos.filter((r) => r.label.trim() && r.url.trim());
      return updateProjectRepositories(project.id, cleaned);
    },
    onSuccess: () => {
      toast.success(t("pages.settings.repositories.saved"));
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error(t("pages.settings.failedToSave"));
    },
  });

  function addRepo() {
    setRepos((prev) => [...prev, { label: "", url: "" }]);
  }

  function removeRepo(index: number) {
    setRepos((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRepo(index: number, field: keyof ProjectRepository, value: string) {
    setRepos((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  return (
    <Card className="max-w-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <GitBranch className="size-4" />
          {t("pages.settings.repositories.title")}
        </CardTitle>
        <CardDescription>{t("pages.settings.repositories.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {repos.map((repo, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                <Input
                  placeholder={t("pages.settings.repositories.labelPlaceholder")}
                  value={repo.label}
                  onChange={(e) => updateRepo(index, "label", e.target.value)}
                  className="sm:w-36"
                />
                <Input
                  placeholder={t("pages.settings.repositories.urlPlaceholder")}
                  value={repo.url}
                  onChange={(e) => updateRepo(index, "url", e.target.value)}
                  className="flex-1"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRepo(index)}
                className="shrink-0"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={addRepo}>
              <Plus className="size-4" />
              {t("pages.settings.repositories.add")}
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              size="sm"
            >
              {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Generic integration card ─────────────────────────────────────────────────

function ConnectedBadge() {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <Check className="size-3" />
      {t("common.connected")}
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
  const { t } = useTranslation();
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
              {connected ? t("common.update") : t("common.connect")}
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
