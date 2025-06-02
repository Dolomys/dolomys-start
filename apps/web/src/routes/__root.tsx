import { Toaster } from "@/components/ui/sonner";
import { ORPCContext, link } from "@/utils/orpc";
import { createORPCClient } from "@orpc/client";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import type { RouterClient } from "@orpc/server";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, createRootRouteWithContext, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useState } from "react";
import type { appRouter } from "../../../server/src/routers";
import "../index.css";
import { SearchProvider } from "@/context/search-context";
import { BounceLoader } from "@/components/loader";
import { NotFoundPage } from "@/components/not-found";

export const Route = createRootRouteWithContext()({
  component: RootComponent,
  notFoundComponent: () => <NotFoundPage />,
  head: () => ({
    meta: [
      {
        title: "My App",
      },
      {
        name: "description",
        content: "My App is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  const isFetching = useRouterState({
    select: (s) => s.isLoading,
  });

  const [client] = useState<RouterClient<typeof appRouter>>(() => createORPCClient(link));
  const [orpcUtils] = useState(() => createORPCReactQueryUtils(client));

  return (
    <>
      <HeadContent />

      <ORPCContext.Provider value={orpcUtils}>
        <SearchProvider>
          <div className="grid h-svh grid-rows-[auto_1fr]">{isFetching ? <BounceLoader /> : <Outlet />}</div>
        </SearchProvider>
        <Toaster richColors />
      </ORPCContext.Provider>

      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
