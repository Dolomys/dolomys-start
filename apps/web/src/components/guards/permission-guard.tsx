import { usePermissions } from "@/hooks/use-permissions";
import type { PermissionCheck } from "@dolomys/auth";
import type { ReactNode } from "react";
import { BounceLoader } from "../loader";

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermissions: PermissionCheck;
  fallback?: ReactNode;
  showLoader?: boolean;
}

export function PermissionGuard({
  children,
  requiredPermissions,
  fallback = null,
  showLoader = true,
}: PermissionGuardProps) {
  const { isPending, data } = usePermissions(requiredPermissions);

  if (isPending && showLoader) {
    return <BounceLoader />;
  }

  return data ? <>{children}</> : <>{fallback}</>;
}

export function RequirePermissions({
  children,
  permissions,
  fallback = null,
}: {
  children: ReactNode;
  permissions: PermissionCheck;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard requiredPermissions={permissions} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}
