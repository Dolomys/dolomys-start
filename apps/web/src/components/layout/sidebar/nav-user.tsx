import { IconChevronRight } from "@tabler/icons-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Assuming shadcn avatar
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import type { User } from "better-auth";
import UserMenu from "./user-menu";

interface NavUserProps {
  user: User;
}

export function NavUser({ user }: NavUserProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserMenu>
          <SidebarMenuButton className="h-auto justify-start px-2 py-1.5 cursor-pointer">
            <Avatar className="size-7">
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="ml-2 flex min-w-0 flex-col items-start justify-center">
              <span className="truncate text-xs font-medium leading-5 text-foreground">{user.name}</span>
              <span className="truncate text-[11px] leading-4 text-muted-foreground">{user.email}</span>
            </span>
            <IconChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
          </SidebarMenuButton>
        </UserMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
