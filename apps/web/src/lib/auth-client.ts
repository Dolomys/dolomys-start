import { type PermissionCheck, Role, access, roles } from "@dolomys/auth";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_SERVER_URL,
	plugins: [
		adminClient({
			ac: access,
			roles,
			defaultRole: Role.Employee,
			adminRoles: [Role.Admin],
		}),
	],
});

/**
 * Check if current user has specific permissions
 */
export async function checkUserPermissions(permissions: PermissionCheck) {
	try {
		return await authClient.admin.hasPermission({
			permissions,
		});
	} catch (error) {
		console.error("Permission check failed:", error);
		return false;
	}
}

/**
 * Check role permissions without requiring current user
 */
export async function checkRolePermissions(
	role: Role,
	permissions: PermissionCheck,
) {
	try {
		return await authClient.admin.checkRolePermission({
			permissions,
			role,
		});
	} catch (error) {
		console.error("Role permission check failed:", error);
		return false;
	}
}
