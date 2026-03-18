import { useMatches } from "@tanstack/react-router";
import { Github } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Separator } from "#/components/ui/separator";
import { SidebarTrigger } from "#/components/ui/sidebar";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/generate/image": "Generate Image",
  "/generate/sound": "Generate Sound",
  "/library": "Library",
  "/settings": "Settings",
  "/about": "About",
};

const repos = [
  { label: "Mobile", href: "https://github.com/WallysonGalvao/wakemind" },
  { label: "LP", href: "https://github.com/WallysonGalvao/wakemindapp" },
  {
    label: "Studio",
    href: "https://github.com/WallysonGalvao/wakemind-studio",
  },
];

export function SiteHeader() {
  const matches = useMatches();
  const currentMatch = matches[matches.length - 1];
  const currentPath = currentMatch?.pathname ?? "/";
  const pageLabel = routeLabels[currentPath] ?? "Page";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Github className="size-4" />
                GitHub
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {repos.map((repo) => (
                <DropdownMenuItem key={repo.label} asChild>
                  <a href={repo.href} target="_blank" rel="noopener noreferrer">
                    {repo.label}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="sm:hidden" asChild>
            <a
              href="https://github.com/WallysonGalvao/wakemind-studio"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="size-4" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
