import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Image as ImageIcon, Library, Music } from "lucide-react";
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
  "Zod",
  "axios",
  "sonner",
];

function About() {
  const { t } = useTranslation();

  const HOW_TO = [
    {
      icon: ImageIcon,
      title: t("pages.about.generateImageCard.title"),
      description: t("pages.about.generateImageCard.description"),
      to: "/generate/image" as const,
      cta: t("pages.about.generateImageCard.cta"),
      badge: null as string | null,
    },
    {
      icon: Music,
      title: t("pages.about.generateSoundCard.title"),
      description: t("pages.about.generateSoundCard.description"),
      to: "/generate/sound" as const,
      cta: t("pages.about.generateSoundCard.cta"),
      badge: t("common.comingSoon") as string | null,
    },
    {
      icon: Library,
      title: t("pages.about.libraryCard.title"),
      description: t("pages.about.libraryCard.description"),
      to: "/library" as const,
      cta: t("pages.about.libraryCard.cta"),
      badge: null as string | null,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Hero */}
      <Card>
        <CardHeader className="gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-white p-2 shadow-lg">
              <img src={logo} alt="Three Wolves" className="size-full object-contain" />
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
          <p>
            {t("common.settings")}{" "}
            <Link
              to="/settings"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {t("common.settings")}
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* How to use */}
      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          {t("pages.about.howToUse")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {HOW_TO.map(({ icon: Icon, title, description, to, cta, badge }) => (
            <Card key={to} className="flex flex-col">
              <CardHeader className="gap-2 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-5 text-muted-foreground" />
                  </div>
                  {badge && (
                    <Badge variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <Button variant="outline" size="sm" asChild className="w-fit">
                  <Link to={to}>{cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Providers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("pages.about.providers.title")}</CardTitle>
          <CardDescription>{t("pages.about.providers.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                {t("pages.about.providers.openai.name")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("pages.about.providers.openai.description")}
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <a
                href="https://platform.openai.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" />
                {t("pages.about.providers.openai.docs")}
              </a>
            </Button>
          </div>
          <div className="flex items-start gap-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">
                  {t("pages.about.providers.sound.name")}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {t("common.comingSoon")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("pages.about.providers.sound.description")}
              </p>
            </div>
          </div>
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
    </div>
  );
}
