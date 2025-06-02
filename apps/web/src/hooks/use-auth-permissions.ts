import {
	authClient,
	checkRolePermissions,
	checkUserPermissions,
} from "@/lib/auth-client";
import type { PermissionCheck, Role } from "@dolomys/auth";
import {
	useConditionalRender,
	usePermissions,
	useRouteGuard,
} from "@dolomys/auth/hooks";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to get current user session and permissions
 */
export function useAuthPermissions() {
	const { data: session, isPending } = authClient.useSession();
	const userRole = session?.user?.role;

	// Use local permission checking
	const permissions = usePermissions(userRole);

	// Conditional rendering helper
	const conditionalRender = useConditionalRender(userRole);

	// Route guard helper
	const routeGuard = useRouteGuard(userRole);

	return {
		session,
		user: session?.user,
		isPending,
		isAuthenticated: !!session?.user,
		userRole,
		...permissions,
		conditionalRender,
		routeGuard,
	};
}

/**
 * Hook for server-side permission checking using Better Auth API
 */
export function useServerPermissions(permissions: PermissionCheck) {
	return useQuery({
		queryKey: ["permissions", permissions],
		queryFn: () => checkUserPermissions(permissions),
		enabled: !!authClient.useSession().data?.user,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook for checking role permissions
 */
export function useRolePermissions(role: Role, permissions: PermissionCheck) {
	return useQuery({
		queryKey: ["role-permissions", role, permissions],
		queryFn: () => checkRolePermissions(role, permissions),
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

/**
 * Hook for admin-specific functionality
 */
export function useAdminPermissions() {
	const { session, isAdmin, permissions } = useAuthPermissions();

	const adminActions = useQuery({
		queryKey: ["admin-permissions"],
		queryFn: () =>
			checkUserPermissions({
				users: ["ban", "impersonate"],
				session: ["revoke", "delete"],
				settings: ["update"],
			}),
		enabled: isAdmin,
		staleTime: 5 * 60 * 1000,
	});

	return {
		isAdmin,
		canBanUsers: adminActions.data || permissions.canBanUsers,
		canImpersonateUsers: adminActions.data || permissions.canImpersonateUsers,
		canManageSettings: adminActions.data || permissions.canManageSettings,
		canManageSessions: adminActions.data || permissions.canManageSessions,
	};
}

/**
 * Hook for manager-specific functionality
 */
export function useManagerPermissions() {
	const { isManagerOrAdmin, permissions } = useAuthPermissions();

	const managerActions = useQuery({
		queryKey: ["manager-permissions"],
		queryFn: () =>
			checkUserPermissions({
				projects: ["create", "update", "delete", "share"],
				files: ["update", "delete"],
				analytics: ["read"],
			}),
		enabled: isManagerOrAdmin,
		staleTime: 5 * 60 * 1000,
	});

	return {
		isManagerOrAdmin,
		canManageProjects: managerActions.data || permissions.canManageProjects,
		canShareProjects: managerActions.data || permissions.canShareProjects,
		canViewAnalytics: managerActions.data || permissions.canViewAnalytics,
		canManageFiles: managerActions.data || permissions.canManageFiles,
	};
}
