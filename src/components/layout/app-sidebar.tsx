import { Link, useParams, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  Library,
  Music,
  Settings,
  Zap,
} from "lucide-react";
import * as React from "react";

import { NavUser } from "@/components/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { user } = useAuth();
  const params = useParams({ strict: false }) as { projectSlug?: string };
  const projectSlug = params.projectSlug;

  const navUser = {
    name: user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Fenrir User",
    email: user?.email ?? "",
    avatarUrl: (user?.user_metadata?.avatar_url as string | undefined) ?? "",
  };

  // When inside a project, show project-scoped navigation
  if (projectSlug) {
    const navMain = [
      { label: "Dashboard", icon: LayoutDashboard, to: `/${projectSlug}/dashboard` },
      { label: "Generate Image", icon: ImageIcon, to: `/${projectSlug}/generate/image` },
      { label: "Generate Sound", icon: Music, to: `/${projectSlug}/generate/sound` },
      { label: "Library", icon: Library, to: `/${projectSlug}/library` },
      { label: "Analytics", icon: BarChart3, to: `/${projectSlug}/analytics` },
    ];

    const navSecondary = [
      { label: "Settings", icon: Settings, to: `/${projectSlug}/settings` },
      { label: "All Projects", icon: Zap, to: "/" },
    ];

    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <Link to="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <Zap className="size-5" fill="currentColor" />
                  </div>
                  <span className="text-base font-semibold">Fenrir</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs tracking-wider text-muted-foreground uppercase">
              {projectSlug}
            </SidebarGroupLabel>
            <SidebarGroupContent className="flex flex-col gap-2">
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={currentPath === item.to}
                      tooltip={item.label}
                    >
                      <Link to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {navSecondary.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <Link to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <NavUser user={navUser} />
        </SidebarFooter>
      </Sidebar>
    );
  }

  // Hub-level navigation (no project selected)
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Zap className="size-5" fill="currentColor" />
                </div>
                <span className="text-base font-semibold">Fenrir</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={currentPath === "/"}
                  tooltip="Projects"
                >
                  <Link to="/">
                    <LayoutDashboard />
                    <span>Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Get Help">
                  <Link to="/about">
                    <HelpCircle />
                    <span>Get Help</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
