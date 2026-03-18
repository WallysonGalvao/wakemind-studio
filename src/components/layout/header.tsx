import { useMatches } from "@tanstack/react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "#/components/ui/breadcrumb";
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
      </div>
    </header>
  );
}
