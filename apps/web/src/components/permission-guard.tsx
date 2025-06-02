import { useAuthPermissions } from "@/hooks/use-auth-permissions";
import type { PermissionCheck } from "@dolomys/auth";
import type { ReactNode } from "react";

interface PermissionGuardProps {
	children: ReactNode;
	requiredPermissions?: PermissionCheck;
	requiredRoles?: string[];
	fallback?: ReactNode;
	showLoader?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export function PermissionGuard({
	children,
	requiredPermissions,
	requiredRoles,
	fallback = null,
	showLoader = false,
}: PermissionGuardProps) {
	const { isPending, shouldShow } = useAuthPermissions();

	if (isPending && showLoader) {
		return <div className="animate-pulse">Loading...</div>;
	}

	const canShow = shouldShow(requiredPermissions, requiredRoles);

	return canShow ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component for admin-only content
 */
export function AdminOnly({
	children,
	fallback = null,
}: { children: ReactNode; fallback?: ReactNode }) {
	return (
		<PermissionGuard requiredRoles={["admin"]} fallback={fallback}>
			{children}
		</PermissionGuard>
	);
}

/**
 * Component for manager and admin content
 */
export function ManagerOrAdminOnly({
	children,
	fallback = null,
}: { children: ReactNode; fallback?: ReactNode }) {
	return (
		<PermissionGuard requiredRoles={["admin", "manager"]} fallback={fallback}>
			{children}
		</PermissionGuard>
	);
}

/**
 * Component for specific permission requirements
 */
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
