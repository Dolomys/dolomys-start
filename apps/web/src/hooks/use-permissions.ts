import { authClient, checkUserPermissions } from "@/lib/auth-client";
import type { PermissionCheck } from "@dolomys/auth";
import { useQuery } from "@tanstack/react-query";

export function usePermissions(permissions: PermissionCheck) {
  return useQuery({
    queryKey: ["permissions", permissions],
    queryFn: () => checkUserPermissions(permissions),
    enabled: !!authClient.useSession().data?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
