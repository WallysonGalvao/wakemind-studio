import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Music,
  Library,
  Settings,
  Zap,
} from "lucide-react";

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
  SidebarRail,
} from "#/components/ui/sidebar";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" as const },
  { label: "Generate Image", icon: ImageIcon, to: "/generate/image" as const },
  { label: "Generate Sound", icon: Music, to: "/generate/sound" as const },
  { label: "Library", icon: Library, to: "/library" as const },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Zap size={18} fill="currentColor" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-tight">
                    WAKEMIND
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Studio
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
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
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link to="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-3 pb-2 text-[10px] text-muted-foreground/50 font-mono uppercase tracking-widest group-data-[collapsible=icon]:hidden">
          v1.0.0-alpha
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
