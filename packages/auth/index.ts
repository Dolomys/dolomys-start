// Export statements and policies
export { statements } from "./statements";
export { access, roles, Role } from "./policies";

// Export utility functions and types
export {
	hasPermission,
	canAccess,
	getRolePermissions,
	isAdmin,
	isManagerOrAdmin,
	getHighestRole,
	isBanned,
	shouldShowElement,
	getUserActionsForResource,
	getUserEffectivePermissions,
	filterMenuByPermissions,
	createPermissionGuard,
	createRoleGuard,
	guards,
	type Permission,
	type Action,
	type PermissionCheck,
	type AuthUser,
} from "./utils";
