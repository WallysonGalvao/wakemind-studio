import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  ExternalLink,
  Image as ImageIcon,
  LayoutDashboard,
  Library,
  Music,
  Settings,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import logo from "@/assets/images/fenrir.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  component: About,
});

const STACK = [
  "React 19",
  "TanStack Router",
  "Tailwind CSS v4",
  "Vite 7",
  "Radix UI",
  "Recharts",
  "Supabase",
  "React Query",
  "Zod",
];

function About() {
  const { t } = useTranslation();

  const FEATURES = [
    {
      icon: LayoutDashboard,
      title: t("pages.about.dashboardCard.title"),
      description: t("pages.about.dashboardCard.description"),
    },
    {
      icon: ImageIcon,
      title: t("pages.about.generateImageCard.title"),
      description: t("pages.about.generateImageCard.description"),
    },
    {
      icon: Music,
      title: t("pages.about.generateSoundCard.title"),
      description: t("pages.about.generateSoundCard.description"),
    },
    {
      icon: Library,
      title: t("pages.about.libraryCard.title"),
      description: t("pages.about.libraryCard.description"),
    },
    {
      icon: BarChart3,
      title: t("pages.about.analyticsCard.title"),
      description: t("pages.about.analyticsCard.description"),
    },
    {
      icon: Settings,
      title: t("pages.about.settingsCard.title"),
      description: t("pages.about.settingsCard.description"),
    },
  ];

  const INTEGRATIONS = [
    {
      name: t("pages.about.integrations.openai.name"),
      description: t("pages.about.integrations.openai.description"),
      href: "https://platform.openai.com",
      docsLabel: t("pages.about.integrations.openai.docs"),
    },
    {
      name: t("pages.about.integrations.mixpanel.name"),
      description: t("pages.about.integrations.mixpanel.description"),
      href: "https://mixpanel.com",
      docsLabel: t("pages.about.integrations.mixpanel.docs"),
    },
    {
      name: t("pages.about.integrations.revenuecat.name"),
      description: t("pages.about.integrations.revenuecat.description"),
      href: "https://www.revenuecat.com",
      docsLabel: t("pages.about.integrations.revenuecat.docs"),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Hero */}
      <Card>
        <CardHeader className="gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-white p-2 shadow-lg">
              <img src={logo} alt="Fenrir" className="size-full object-contain" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                {t("pages.about.title")}
              </CardTitle>
              <CardDescription>{t("pages.about.subtitle")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
          <p>{t("pages.about.description")}</p>
        </CardContent>
      </Card>

      {/* Features */}
      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          {t("pages.about.features")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="flex flex-col">
              <CardHeader className="gap-2 pb-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("pages.about.integrations.title")}
          </CardTitle>
          <CardDescription>{t("pages.about.integrations.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {INTEGRATIONS.map((integration) => (
            <div
              key={integration.name}
              className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{integration.name}</p>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </div>
              <Button variant="ghost" size="sm" asChild className="shrink-0">
                <a href={integration.href} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  {integration.docsLabel}
                </a>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("pages.about.stack.title")}</CardTitle>
          <CardDescription>{t("pages.about.stack.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STACK.map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("pages.about.gettingStarted.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          <p>
            {t("pages.about.gettingStarted.description")}{" "}
            <Link
              to="/"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {t("pages.about.gettingStarted.link")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
