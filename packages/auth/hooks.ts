import { useCallback, useMemo } from "react";
import {
	type AuthUser,
	type Permission,
	type PermissionCheck,
	type Role,
	canAccess,
	getHighestRole,
	getUserActionsForResource,
	getUserEffectivePermissions,
	guards,
	hasPermission,
	isAdmin,
	isManagerOrAdmin,
	shouldShowElement,
} from "./utils";

/**
 * Hook for checking user permissions
 */
export function usePermissions(userRole: string | string[] | null | undefined) {
	const checkPermission = useCallback(
		(permissions: PermissionCheck) => hasPermission(userRole, permissions),
		[userRole],
	);

	const checkAccess = useCallback(
		(resource: Permission, action: string) =>
			canAccess(userRole, resource, action),
		[userRole],
	);

	const checkRole = useCallback(
		(allowedRoles: string[]) => {
			if (!userRole) return false;
			const userRoles = Array.isArray(userRole) ? userRole : [userRole];
			return userRoles.some((role) => allowedRoles.includes(role));
		},
		[userRole],
	);

	const userIsAdmin = useMemo(() => isAdmin(userRole), [userRole]);
	const userIsManagerOrAdmin = useMemo(
		() => isManagerOrAdmin(userRole),
		[userRole],
	);
	const highestRole = useMemo(() => getHighestRole(userRole), [userRole]);

	const effectivePermissions = useMemo(
		() => getUserEffectivePermissions(userRole),
		[userRole],
	);

	const getActionsForResource = useCallback(
		(resource: Permission) => getUserActionsForResource(userRole, resource),
		[userRole],
	);

	const shouldShow = useCallback(
		(requiredPermissions?: PermissionCheck, requiredRoles?: string[]) =>
			shouldShowElement(userRole, requiredPermissions, requiredRoles),
		[userRole],
	);

	// Pre-computed common permissions
	const permissions = useMemo(
		() => ({
			canManageUsers: guards.canManageUsers(userRole),
			canViewUsers: guards.canViewUsers(userRole),
			canBanUsers: guards.canBanUsers(userRole),
			canImpersonateUsers: guards.canImpersonateUsers(userRole),

			canManageProjects: guards.canManageProjects(userRole),
			canViewProjects: guards.canViewProjects(userRole),
			canShareProjects: guards.canShareProjects(userRole),

			canUploadFiles: guards.canUploadFiles(userRole),
			canDeleteFiles: guards.canDeleteFiles(userRole),
			canManageFiles: guards.canManageFiles(userRole),

			canViewAnalytics: guards.canViewAnalytics(userRole),
			canExportAnalytics: guards.canExportAnalytics(userRole),

			canManageSettings: guards.canManageSettings(userRole),
			canViewSettings: guards.canViewSettings(userRole),

			canManageSessions: guards.canManageSessions(userRole),
		}),
		[userRole],
	);

	return {
		// Core permission checking
		hasPermission: checkPermission,
		canAccess: checkAccess,
		checkRole,

		// Role information
		isAdmin: userIsAdmin,
		isManagerOrAdmin: userIsManagerOrAdmin,
		highestRole,

		// Utility functions
		shouldShow,
		getActionsForResource,
		effectivePermissions,

		// Pre-computed permissions
		permissions,
	};
}

/**
 * Hook for UI element visibility based on permissions
 */
export function usePermissionGuard(
	requiredPermissions?: PermissionCheck,
	requiredRoles?: string[],
) {
	return (userRole: string | string[] | null | undefined) =>
		shouldShowElement(userRole, requiredPermissions, requiredRoles);
}

/**
 * Hook for creating permission-based components
 */
export function useConditionalRender(
	userRole: string | string[] | null | undefined,
) {
	return useCallback(
		(
			component: any,
			requiredPermissions?: PermissionCheck,
			requiredRoles?: string[],
			fallback?: any,
		) => {
			const canShow = shouldShowElement(
				userRole,
				requiredPermissions,
				requiredRoles,
			);
			return canShow ? component : fallback || null;
		},
		[userRole],
	);
}

/**
 * Hook for role-based navigation guards
 */
export function useRouteGuard(userRole: string | string[] | null | undefined) {
	return useCallback(
		(requiredPermissions?: PermissionCheck, requiredRoles?: string[]) => {
			return {
				canAccess: shouldShowElement(
					userRole,
					requiredPermissions,
					requiredRoles,
				),
				redirectTo: userRole ? "/unauthorized" : "/login",
			};
		},
		[userRole],
	);
}

/**
 * Hook for admin-specific functionality
 */
export function useAdminActions(
	userRole: string | string[] | null | undefined,
) {
	const userIsAdmin = useMemo(() => isAdmin(userRole), [userRole]);

	const adminPermissions = useMemo(
		() => ({
			canBanUsers: guards.canBanUsers(userRole),
			canImpersonateUsers: guards.canImpersonateUsers(userRole),
			canManageAllProjects: guards.canManageProjects(userRole),
			canManageSettings: guards.canManageSettings(userRole),
			canExportAnalytics: guards.canExportAnalytics(userRole),
			canManageSessions: guards.canManageSessions(userRole),
		}),
		[userRole],
	);

	return {
		isAdmin: userIsAdmin,
		permissions: adminPermissions,
	};
}

/**
 * Hook for manager-specific functionality
 */
export function useManagerActions(
	userRole: string | string[] | null | undefined,
) {
	const userIsManagerOrAdmin = useMemo(
		() => isManagerOrAdmin(userRole),
		[userRole],
	);

	const managerPermissions = useMemo(
		() => ({
			canManageProjects: guards.canManageProjects(userRole),
			canShareProjects: guards.canShareProjects(userRole),
			canViewAnalytics: guards.canViewAnalytics(userRole),
			canManageFiles: guards.canManageFiles(userRole),
		}),
		[userRole],
	);

	return {
		isManagerOrAdmin: userIsManagerOrAdmin,
		permissions: managerPermissions,
	};
}
