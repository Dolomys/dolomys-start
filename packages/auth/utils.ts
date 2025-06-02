import { roles } from "./policies";
import type { statements } from "./statements";

export type Permission = keyof typeof statements;
export type Action<T extends Permission> = (typeof statements)[T][number];
export type Role = keyof typeof roles;

// Type for permission checks
export type PermissionCheck = {
	[K in Permission]?: Action<K>[];
};

// Enhanced user type for better type safety
export interface AuthUser {
	id: string;
	email: string;
	name: string;
	role: string | string[] | null;
	banned?: boolean;
	banReason?: string;
	banExpires?: Date;
}

/**
 * Check if a user has specific permissions based on their role
 */
export function hasPermission(
	userRole: string | string[] | null | undefined,
	permissions: PermissionCheck,
): boolean {
	if (!userRole) return false;

	const userRoles = Array.isArray(userRole) ? userRole : [userRole];

	return userRoles.some((role) => {
		const roleKey = role as Role;
		if (!roles[roleKey]) return false;

		return Object.entries(permissions).every(([resource, actions]) => {
			const resourceKey = resource as Permission;
			const roleStatements = roles[roleKey].statements;
			const rolePermissions =
				(roleStatements as Record<string, string[]>)[resourceKey] || [];

			return (
				actions?.every((action) => rolePermissions.includes(action)) ?? false
			);
		});
	});
}

/**
 * Check if a user can access a specific resource with an action
 */
export function canAccess(
	userRole: string | string[] | null | undefined,
	resource: Permission,
	action: string,
): boolean {
	return hasPermission(userRole, { [resource]: [action] } as PermissionCheck);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role) {
	return roles[role]?.statements || {};
}

/**
 * Check if user has any admin role
 */
export function isAdmin(
	userRole: string | string[] | null | undefined,
): boolean {
	if (!userRole) return false;
	const userRoles = Array.isArray(userRole) ? userRole : [userRole];
	return userRoles.includes("admin");
}

/**
 * Check if user has manager or admin role
 */
export function isManagerOrAdmin(
	userRole: string | string[] | null | undefined,
): boolean {
	if (!userRole) return false;
	const userRoles = Array.isArray(userRole) ? userRole : [userRole];
	return userRoles.some((role) => ["admin", "manager"].includes(role));
}

/**
 * Get user's highest role priority (admin > manager > employee)
 */
export function getHighestRole(
	userRole: string | string[] | null | undefined,
): Role | null {
	if (!userRole) return null;
	const userRoles = Array.isArray(userRole) ? userRole : [userRole];

	if (userRoles.includes("admin")) return "admin" as Role;
	if (userRoles.includes("manager")) return "manager" as Role;
	if (userRoles.includes("employee")) return "employee" as Role;

	return null;
}

/**
 * Check if user is banned
 */
export function isBanned(user: AuthUser): boolean {
	if (!user.banned) return false;
	if (!user.banExpires) return true;
	return new Date() < user.banExpires;
}

/**
 * Filter menu items based on user permissions
 */
export function filterMenuByPermissions<
	T extends { requiredPermissions?: PermissionCheck },
>(menuItems: T[], userRole: string | string[] | null | undefined): T[] {
	return menuItems.filter((item) => {
		if (!item.requiredPermissions) return true;
		return hasPermission(userRole, item.requiredPermissions);
	});
}

/**
 * Higher-order function to create permission-based guards
 */
export function createPermissionGuard(permissions: PermissionCheck) {
	return (userRole: string | string[] | null | undefined) => {
		return hasPermission(userRole, permissions);
	};
}

/**
 * Create a role-based guard
 */
export function createRoleGuard(allowedRoles: string[]) {
	return (userRole: string | string[] | null | undefined) => {
		if (!userRole) return false;
		const userRoles = Array.isArray(userRole) ? userRole : [userRole];
		return userRoles.some((role) => allowedRoles.includes(role));
	};
}

// Common permission guards
export const guards = {
	canManageUsers: createPermissionGuard({
		users: ["create", "update", "delete"],
	}),
	canViewUsers: createPermissionGuard({ users: ["read"] }),
	canBanUsers: createPermissionGuard({ users: ["ban"] }),
	canImpersonateUsers: createPermissionGuard({ users: ["impersonate"] }),

	canManageProjects: createPermissionGuard({
		projects: ["create", "update", "delete"],
	}),
	canViewProjects: createPermissionGuard({ projects: ["read"] }),
	canShareProjects: createPermissionGuard({ projects: ["share"] }),

	canUploadFiles: createPermissionGuard({ files: ["upload"] }),
	canDeleteFiles: createPermissionGuard({ files: ["delete"] }),
	canManageFiles: createPermissionGuard({ files: ["update", "delete"] }),

	canViewAnalytics: createPermissionGuard({ analytics: ["read"] }),
	canExportAnalytics: createPermissionGuard({ analytics: ["export"] }),

	canManageSettings: createPermissionGuard({ settings: ["update"] }),
	canViewSettings: createPermissionGuard({ settings: ["read"] }),

	canManageSessions: createPermissionGuard({ session: ["revoke", "delete"] }),

	// Role-based guards
	isAdmin: createRoleGuard(["admin"]),
	isManagerOrAdmin: createRoleGuard(["admin", "manager"]),
	isEmployee: createRoleGuard(["employee"]),
} as const;

/**
 * UI Helper: Check if element should be visible based on permissions
 */
export function shouldShowElement(
	userRole: string | string[] | null | undefined,
	requiredPermissions?: PermissionCheck,
	requiredRoles?: string[],
): boolean {
	if (requiredPermissions && !hasPermission(userRole, requiredPermissions)) {
		return false;
	}

	if (requiredRoles && !createRoleGuard(requiredRoles)(userRole)) {
		return false;
	}

	return true;
}

/**
 * Get all available actions for a user on a specific resource
 */
export function getUserActionsForResource(
	userRole: string | string[] | null | undefined,
	resource: Permission,
): string[] {
	if (!userRole) return [];

	const userRoles = Array.isArray(userRole) ? userRole : [userRole];
	const allActions = new Set<string>();

	userRoles.forEach((role) => {
		const roleKey = role as Role;
		if (roles[roleKey]) {
			const roleStatements = roles[roleKey].statements;
			const resourceActions =
				(roleStatements as Record<string, string[]>)[resource] || [];
			resourceActions.forEach((action) => allActions.add(action));
		}
	});

	return Array.from(allActions);
}

/**
 * Get user's effective permissions (all permissions across all roles)
 */
export function getUserEffectivePermissions(
	userRole: string | string[] | null | undefined,
): Record<string, string[]> {
	if (!userRole) return {};

	const userRoles = Array.isArray(userRole) ? userRole : [userRole];
	const effectivePermissions: Record<string, Set<string>> = {};

	userRoles.forEach((role) => {
		const roleKey = role as Role;
		if (roles[roleKey]) {
			const roleStatements = roles[roleKey].statements as Record<
				string,
				string[]
			>;
			Object.entries(roleStatements).forEach(([resource, actions]) => {
				if (!effectivePermissions[resource]) {
					effectivePermissions[resource] = new Set();
				}
				actions.forEach((action) => effectivePermissions[resource].add(action));
			});
		}
	});

	// Convert Sets back to arrays
	const result: Record<string, string[]> = {};
	Object.entries(effectivePermissions).forEach(([resource, actionsSet]) => {
		result[resource] = Array.from(actionsSet);
	});

	return result;
}
