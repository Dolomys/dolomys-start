import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils"; // Assuming you have a utility for class names
import type { NavGroupData } from "../data/sidebar-items";
import { Link } from "@tanstack/react-router";

interface NavGroupProps {
  group: NavGroupData;
  className?: string;
}

export function NavGroup({ group, className }: NavGroupProps) {
  // Basic rendering - we might need Accordion for nested items later
  return (
    <div className={cn("flex flex-col gap-y-1 py-2", className)}>
      {group.title && <h4 className="px-3 text-xs font-medium uppercase text-muted-foreground">{group.title}</h4>}
      <SidebarMenu>
        {group.items.map((item) => (
          <SidebarMenuItem key={item.url}>
            {/* Use Link from Tanstack Router eventually */}
            <SidebarMenuButton asChild>
              <Link to={item.url}>
                <item.icon className="size-4" />
                <span>{item.title}</span>
                {item.badge && (
                  <span className="ml-auto inline-flex items-center justify-center rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
            {/* Add logic here to render nested item.items if they exist */}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}
