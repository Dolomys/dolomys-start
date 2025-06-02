import ComingSoon from "@/components/coming-soon";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { BounceLoader } from "@/components/loader";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserContext } from "@/context/user-context";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_dashboard")({
  component: RouteComponent,
  notFoundComponent: () => <ComingSoon />,
});

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = Route.useNavigate();

  useEffect(() => {
    if (!session && !isPending) {
      navigate({ to: "/login" });
    }
  }, [session, isPending]);

  if (isPending || !session) return <BounceLoader />;

  return (
    <UserContext.Provider value={session.user}>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-col flex-1">
            <div className="@container/main flex flex-1 flex-col gap-2 p-4">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </UserContext.Provider>
  );
}
