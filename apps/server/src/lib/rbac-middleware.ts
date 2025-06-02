import { type PermissionCheck, hasPermission } from "@dolomys/auth";
import type { User } from "better-auth/types";
import type { Context } from "hono";
import { auth } from "./auth";

export interface AuthenticatedContext extends Context {
  user: User;
}

interface ExtendedUser extends User {
  role: string | string[] | null;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
}

/**
 * Normalize user roles to always return an array
 */
function normalizeRoles(userRole: string | string[] | null | undefined): string[] {
  if (!userRole) return [];
  return Array.isArray(userRole) ? userRole : [userRole];
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

  const user = session.user as ExtendedUser;

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
        403
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
      if (hasPermissionResult && typeof hasPermissionResult === "object" && "hasPermission" in hasPermissionResult) {
        if (!(hasPermissionResult as any).hasPermission) {
          return c.json(
            {
              error: "Forbidden: Insufficient permissions",
              code: "INSUFFICIENT_PERMISSIONS",
              required: permissions,
              userRole: user.role,
            },
            403
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
            403
          );
        }
      }
    } catch (error) {
      // Fallback to local permission checking if API fails
      console.warn("Better Auth permission API failed, falling back to local check:", error);

      if (!hasPermission(user.role, permissions)) {
        return c.json(
          {
            error: "Forbidden: Insufficient permissions",
            code: "INSUFFICIENT_PERMISSIONS",
            required: permissions,
            userRole: user.role,
          },
          403
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
        403
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

  const userRoles = normalizeRoles(user.role);

  if (!userRoles.includes("admin")) {
    return c.json(
      {
        error: "Forbidden: Admin access required",
        code: "ADMIN_REQUIRED",
      },
      403
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

    const userRoles = normalizeRoles(user.role);

    const hasAllowedRole = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasAllowedRole) {
      return c.json(
        {
          error: "Forbidden",
          code: "INSUFFICIENT_PERMISSIONS",
        },
        403
      );
    }

    await next();
  };
}

export function getCurrentUser(c: Context): ExtendedUser | null {
  return (c.get("user") as ExtendedUser) || null;
}

export function checkUserPermission(c: Context, permissions: PermissionCheck): boolean {
  const user = getCurrentUser(c);
  if (!user) return false;

  return hasPermission(user.role, permissions);
}

export async function checkUserPermissionAPI(c: Context, permissions: PermissionCheck): Promise<boolean> {
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
    console.warn("Better Auth permission API failed, falling back to local check:", error);
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
