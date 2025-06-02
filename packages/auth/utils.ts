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
 * Normalize user roles to always return an array
 */
function normalizeRoles(userRole: string | string[] | null | undefined): string[] {
  if (!userRole) return [];
  return Array.isArray(userRole) ? userRole : [userRole];
}

/**
 * Check if a user has specific permissions based on their role
 */
export function hasPermission(userRole: string | string[] | null | undefined, permissions: PermissionCheck): boolean {
  const userRoles = normalizeRoles(userRole);
  if (userRoles.length === 0) return false;

  return userRoles.some((role) => {
    const roleKey = role as Role;
    if (!roles[roleKey]) return false;

    return Object.entries(permissions).every(([resource, actions]) => {
      const resourceKey = resource as Permission;
      const roleStatements = roles[roleKey].statements;
      const rolePermissions = (roleStatements as Record<string, string[]>)[resourceKey] || [];

      return actions?.every((action) => rolePermissions.includes(action)) ?? false;
    });
  });
}

/**
 * Check if a user can access a specific resource with an action
 */
export function canAccess(
  userRole: string | string[] | null | undefined,
  resource: Permission,
  action: string
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
export function isAdmin(userRole: string | string[] | null | undefined): boolean {
  const userRoles = normalizeRoles(userRole);
  return userRoles.includes("admin");
}

/**
 * Check if user has manager or admin role
 */
export function isManagerOrAdmin(userRole: string | string[] | null | undefined): boolean {
  const userRoles = normalizeRoles(userRole);
  return userRoles.some((role) => ["admin", "manager"].includes(role));
}

/**
 * Get user's highest role priority (admin > manager > employee)
 */
export function getHighestRole(userRole: string | string[] | null | undefined): Role | null {
  const userRoles = normalizeRoles(userRole);
  if (userRoles.length === 0) return null;

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
export function filterMenuByPermissions<T extends { requiredPermissions?: PermissionCheck }>(
  menuItems: T[],
  userRole: string | string[] | null | undefined
): T[] {
  return menuItems.filter((item) => {
    if (!item.requiredPermissions) return true;
    return hasPermission(userRole, item.requiredPermissions);
  });
}

/**
 * Get all available actions for a user on a specific resource
 */
export function getUserActionsForResource(
  userRole: string | string[] | null | undefined,
  resource: Permission
): string[] {
  const userRoles = normalizeRoles(userRole);
  if (userRoles.length === 0) return [];

  const allActions = new Set<string>();

  userRoles.forEach((role) => {
    const roleKey = role as Role;
    if (roles[roleKey]) {
      const roleStatements = roles[roleKey].statements;
      const resourceActions = (roleStatements as Record<string, string[]>)[resource] || [];
      resourceActions.forEach((action) => allActions.add(action));
    }
  });

  return Array.from(allActions);
}

/**
 * Get user's effective permissions (all permissions across all roles)
 */
export function getUserEffectivePermissions(userRole: string | string[] | null | undefined): Record<string, string[]> {
  const userRoles = normalizeRoles(userRole);
  if (userRoles.length === 0) return {};

  const effectivePermissions: Record<string, Set<string>> = {};

  userRoles.forEach((role) => {
    const roleKey = role as Role;
    if (roles[roleKey]) {
      const roleStatements = roles[roleKey].statements as Record<string, string[]>;
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

// Common permission guards - simplified and more efficient
export const guards = {
  // User management
  canManageUsers: (userRole: string | string[] | null | undefined) =>
    hasPermission(userRole, { users: ["create", "update", "delete"] }),
  canViewUsers: (userRole: string | string[] | null | undefined) => hasPermission(userRole, { users: ["read"] }),
  canBanUsers: (userRole: string | string[] | null | undefined) => hasPermission(userRole, { users: ["ban"] }),
  canImpersonateUsers: (userRole: string | string[] | null | undefined) =>
    hasPermission(userRole, { users: ["impersonate"] }),

  // Project management
  canManageProjects: (userRole: string | string[] | null | undefined) =>
    hasPermission(userRole, { projects: ["create", "update", "delete"] }),
  canViewProjects: (userRole: string | string[] | null | undefined) => hasPermission(userRole, { projects: ["read"] }),
  canShareProjects: (userRole: string | string[] | null | undefined) =>
    hasPermission(userRole, { projects: ["share"] }),

  // File management
  canUploadFiles: (userRole: string | string[] | null | undefined) => hasPermission(userRole, { files: ["upload"] }),
  canDeleteFiles: (userRole: string | string[] | null | undefined) => hasPermission(userRole, { files: ["delete"] }),
  canManageFiles: (userRole: string | string[] | null | undefined) =>
    hasPermission(userRole, { files: ["update", "delete"] }),

  // Analytics
  canViewAnalytics: (userRole: string | string[] | null | undefined) =>
    hasPermission(userRole, { analytics: ["read"] }),
  canExportAnalytics: (userRole: string | string[] | null | undefined) =>
    hasPermission(userRole, { analytics: ["export"] }),

  // Settings
  canManageSettings: (userRole: string | string[] | null | undefined) =>
    hasPermission(userRole, { settings: ["update"] }),
  canViewSettings: (userRole: string | string[] | null | undefined) => hasPermission(userRole, { settings: ["read"] }),

  // Session management
  canManageSessions: (userRole: string | string[] | null | undefined) =>
    hasPermission(userRole, { session: ["revoke", "delete"] }),

  // Role-based guards
  isAdmin: (userRole: string | string[] | null | undefined) => isAdmin(userRole),
  isManagerOrAdmin: (userRole: string | string[] | null | undefined) => isManagerOrAdmin(userRole),
  isEmployee: (userRole: string | string[] | null | undefined) => {
    const userRoles = normalizeRoles(userRole);
    return userRoles.includes("employee");
  },
} as const;

/**
 * UI Helper: Check if element should be visible based on permissions
 */
export function shouldShowElement(
  userRole: string | string[] | null | undefined,
  requiredPermissions?: PermissionCheck,
  requiredRoles?: string[]
): boolean {
  if (requiredPermissions && !hasPermission(userRole, requiredPermissions)) {
    return false;
  }

  if (requiredRoles) {
    const userRoles = normalizeRoles(userRole);
    const hasRequiredRole = userRoles.some((role) => requiredRoles.includes(role));
    if (!hasRequiredRole) {
      return false;
    }
  }

  return true;
}
