import { type PermissionCheck, hasPermission } from "@dolomys/auth";
import type { User } from "better-auth/types";
import type { Context } from "hono";
import { auth } from "./auth";

export interface AuthenticatedContext extends Context {
	user: User;
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(c: Context, next: () => Promise<void>) {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session?.user) {
		return c.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, 401);
	}

	const user = session.user as User;

	// Check if user is banned
	if (user.banned) {
		const banExpires = user.banExpires ? new Date(user.banExpires) : null;
		const isBanActive = !banExpires || new Date() < banExpires;

		if (isBanActive) {
			return c.json(
				{
					error: "Account banned",
					code: "ACCOUNT_BANNED",
					reason: user.banReason || "No reason provided",
					expiresAt: banExpires?.toISOString(),
				},
				403,
			);
		}
	}

	// Add user to context
	c.set("user", user);
	await next();
}

/**
 * Middleware to require specific permissions using Better Auth's API
 */
export function requirePermissions(permissions: PermissionCheck) {
	return async (c: Context, next: () => Promise<void>) => {
		const user = c.get("user") as ExtendedUser;

		if (!user) {
			return c.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, 401);
		}

		// Use Better Auth's permission checking API
		try {
			const hasPermissionResult = await auth.api.userHasPermission({
				body: {
					userId: user.id,
					permissions,
				},
			});

			// Check if the result has the expected structure
			if (
				hasPermissionResult &&
				typeof hasPermissionResult === "object" &&
				"hasPermission" in hasPermissionResult
			) {
				if (!(hasPermissionResult as any).hasPermission) {
					return c.json(
						{
							error: "Forbidden: Insufficient permissions",
							code: "INSUFFICIENT_PERMISSIONS",
							required: permissions,
							userRole: user.role,
						},
						403,
					);
				}
			} else {
				// Fallback to local permission checking if API response is unexpected
				if (!hasPermission(user.role, permissions)) {
					return c.json(
						{
							error: "Forbidden: Insufficient permissions",
							code: "INSUFFICIENT_PERMISSIONS",
							required: permissions,
							userRole: user.role,
						},
						403,
					);
				}
			}
		} catch (error) {
			// Fallback to local permission checking if API fails
			console.warn(
				"Better Auth permission API failed, falling back to local check:",
				error,
			);

			if (!hasPermission(user.role, permissions)) {
				return c.json(
					{
						error: "Forbidden: Insufficient permissions",
						code: "INSUFFICIENT_PERMISSIONS",
						required: permissions,
						userRole: user.role,
					},
					403,
				);
			}
		}

		await next();
	};
}

/**
 * Alternative permission middleware using local checking (faster)
 */
export function requirePermissionsLocal(permissions: PermissionCheck) {
	return async (c: Context, next: () => Promise<void>) => {
		const user = c.get("user") as ExtendedUser;

		if (!user) {
			return c.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, 401);
		}

		if (!hasPermission(user.role, permissions)) {
			return c.json(
				{
					error: "Forbidden: Insufficient permissions",
					code: "INSUFFICIENT_PERMISSIONS",
					required: permissions,
					userRole: user.role,
				},
				403,
			);
		}

		await next();
	};
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(c: Context, next: () => Promise<void>) {
	const user = c.get("user") as ExtendedUser;

	if (!user) {
		return c.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, 401);
	}

	const userRole = user.role;
	if (!userRole) {
		return c.json(
			{
				error: "Forbidden: Admin access required",
				code: "ADMIN_REQUIRED",
				userRole: user.role,
			},
			403,
		);
	}

	const userRoles = Array.isArray(userRole) ? userRole : [userRole];

	if (!userRoles.includes("admin")) {
		return c.json(
			{
				error: "Forbidden: Admin access required",
				code: "ADMIN_REQUIRED",
				userRole: user.role,
			},
			403,
		);
	}

	await next();
}

/**
 * Higher-order function to create role-based middleware
 */
export function requireRole(allowedRoles: string[]) {
	return async (c: Context, next: () => Promise<void>) => {
		const user = c.get("user") as ExtendedUser;

		if (!user) {
			return c.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, 401);
		}

		const userRole = user.role;
		if (!userRole) {
			return c.json(
				{
					error: `Forbidden: Requires one of these roles: ${allowedRoles.join(", ")}`,
					code: "INSUFFICIENT_ROLE",
					required: allowedRoles,
					userRole: user.role,
				},
				403,
			);
		}

		const userRoles = Array.isArray(userRole) ? userRole : [userRole];

		const hasAllowedRole = userRoles.some((role) =>
			allowedRoles.includes(role),
		);

		if (!hasAllowedRole) {
			return c.json(
				{
					error: `Forbidden: Requires one of these roles: ${allowedRoles.join(", ")}`,
					code: "INSUFFICIENT_ROLE",
					required: allowedRoles,
					userRole: user.role,
				},
				403,
			);
		}

		await next();
	};
}

/**
 * Get current authenticated user from context
 */
export function getCurrentUser(c: Context): ExtendedUser | null {
	return (c.get("user") as ExtendedUser) || null;
}

/**
 * Utility to check if current user has permission (local check)
 */
export function checkUserPermission(
	c: Context,
	permissions: PermissionCheck,
): boolean {
	const user = getCurrentUser(c);
	if (!user) return false;

	return hasPermission(user.role, permissions);
}

/**
 * Utility to check if current user has permission (using Better Auth API)
 */
export async function checkUserPermissionAPI(
	c: Context,
	permissions: PermissionCheck,
): Promise<boolean> {
	const user = getCurrentUser(c);
	if (!user) return false;

	try {
		const result = await auth.api.userHasPermission({
			body: {
				userId: user.id,
				permissions,
			},
		});

		// Check if the result has the expected structure
		if (result && typeof result === "object" && "hasPermission" in result) {
			return (result as any).hasPermission;
		}

		// Fallback to local check if API response is unexpected
		return hasPermission(user.role, permissions);
	} catch (error) {
		console.warn(
			"Better Auth permission API failed, falling back to local check:",
			error,
		);
		return hasPermission(user.role, permissions);
	}
}

/**
 * Middleware for optional authentication (doesn't fail if not authenticated)
 */
export async function optionalAuth(c: Context, next: () => Promise<void>) {
	try {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});

		if (session?.user) {
			const user = session.user as ExtendedUser;
			if (!user.banned) {
				c.set("user", user);
			}
		}
	} catch (error) {
		// Ignore auth errors for optional auth
		console.debug("Optional auth failed:", error);
	}

	await next();
}

/**
 * Create a permission-based route guard
 */
export function createPermissionGuard(permissions: PermissionCheck) {
	return requirePermissionsLocal(permissions);
}

/**
 * Create a role-based route guard
 */
export function createRoleGuard(allowedRoles: string[]) {
	return requireRole(allowedRoles);
}
