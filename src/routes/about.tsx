import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Image as ImageIcon, Library, Music, Zap } from "lucide-react";

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

const HOW_TO = [
  {
    icon: ImageIcon,
    title: "Generate Image",
    description:
      "Create game-ready icons and assets with a single prompt. Choose a style preset, set the dimensions, and download your PNG in seconds.",
    to: "/generate/image" as const,
    cta: "Open Generator",
    badge: null as string | null,
  },
  {
    icon: Music,
    title: "Generate Sound",
    description:
      "Produce ambient tracks, 8-bit SFX, and notification sounds to pair with your in-game achievements and alarms.",
    to: "/generate/sound" as const,
    cta: "Open Generator",
    badge: "Coming soon" as string | null,
  },
  {
    icon: Library,
    title: "Browse Library",
    description:
      "Review the full catalogue of achievement icons included in the Basic Package. Preview every tier and icon before exporting.",
    to: "/library" as const,
    cta: "Open Library",
    badge: null as string | null,
  },
];

function About() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Hero */}
      <Card>
        <CardHeader className="gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Zap className="size-5" fill="currentColor" />
            </div>
            <div>
              <CardTitle className="text-2xl">Wakemind Studio</CardTitle>
              <CardDescription>
                Asset creation &amp; achievement management for the Wakemind ecosystem
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Wakemind Studio is the creative companion to the Wakemind mobile app — a tool
            that lets developers and creators generate game-quality image assets and sound
            effects powered by AI, manage a library of in-app achievement icons, and
            configure the building blocks of the rewards system that runs inside the
            Wakemind experience.
          </p>
          <p>
            Whether you are bootstrapping a new achievement pack or fine-tuning existing
            assets, the Studio gives you a focused, no-login workflow right in your
            browser. Add your OpenAI API key in{" "}
            <Link
              to="/settings"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Settings
            </Link>{" "}
            and start generating.
          </p>
        </CardContent>
      </Card>

      {/* How to use */}
      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">How to use</h2>
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
          <CardTitle className="text-base">Providers</CardTitle>
          <CardDescription>
            External services powering generation features
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">OpenAI</p>
              <p className="text-sm text-muted-foreground">
                Image generation via{" "}
                <code className="font-mono text-xs">gpt-image-1</code> and{" "}
                <code className="font-mono text-xs">dall-e-3</code>. Requires a personal
                API key configured in Settings.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <a
                href="https://platform.openai.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" />
                Docs
              </a>
            </Button>
          </div>
          <div className="flex items-start gap-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Sound Provider</p>
                <Badge variant="secondary" className="text-xs">
                  Coming soon
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Sound generation will support OpenAI TTS, ElevenLabs, or fal.ai. Provider
                selection will be available in Settings once the feature ships.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stack</CardTitle>
          <CardDescription>Core technologies used in this project</CardDescription>
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
