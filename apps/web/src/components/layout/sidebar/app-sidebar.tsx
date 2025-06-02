import * as React from "react";
import { NavGroup } from "./nav-group"; // Changed path
import { NavUser } from "./nav-user"; // Changed path
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { sidebarData } from "../data/sidebar-items";
import { Link } from "@tanstack/react-router";
import { useCurrentUser } from "@/context/user-context";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useCurrentUser();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/" className="flex items-center gap-2">
                <img src="/logo.png" className="!size-5 rounded-full border-2 border-black" />
                <span className="text-base font-semibold">Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Render navigation groups */}
        {sidebarData.navGroups.map((group, index) => (
          <NavGroup key={index} group={group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
