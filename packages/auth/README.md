# @dolomys/auth

A comprehensive role-based access control (RBAC) system built on top of Better Auth's admin plugin.

## Features

- 🔐 **Role-Based Access Control**: Three-tier role system (Admin, Manager, Employee)
- 🎯 **Granular Permissions**: Fine-grained permission control for resources and actions
- ⚛️ **React Hooks**: Ready-to-use hooks for permission checking
- 🛡️ **Type Safety**: Full TypeScript support with proper type inference
- 🚀 **Performance**: Optimized with local and server-side permission checking
- 🎨 **UI Components**: Permission-based component guards for conditional rendering

## Installation

```bash
npm install @dolomys/auth
```

For React hooks:

```bash
npm install @dolomys/auth react @types/react
```

## Quick Start

### 1. Server Setup

```typescript
// apps/server/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { access, Role, roles } from "@dolomys/auth";

export const auth = betterAuth({
  plugins: [
    admin({
      ac: access,
      roles,
      defaultRole: Role.Employee,
      adminRoles: [Role.Admin],
    }),
  ],
});
```

### 2. Client Setup

```typescript
// apps/web/src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { access, Role, roles } from "@dolomys/auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  plugins: [
    adminClient({
      ac: access,
      roles,
      defaultRole: Role.Employee,
      adminRoles: [Role.Admin],
    }),
  ],
});
```

## Roles & Permissions

### Roles

- **Admin**: Full access to everything + Better Auth admin permissions
- **Manager**: Project management + limited user access
- **Employee**: Read-only access to most resources + file upload

### Resources & Actions

```typescript
const statements = {
  users: ["read", "create", "update", "delete", "ban", "impersonate"],
  projects: ["read", "create", "update", "delete", "share"],
  files: ["read", "upload", "update", "delete"],
  session: ["read", "revoke", "delete"],
  analytics: ["read", "export"],
  settings: ["read", "update"],
};
```

## Usage Examples

### Server-Side Middleware

```typescript
import { requireAuth, requirePermissions, requireRole } from "@/lib/rbac-middleware";

// Basic auth
app.get("/protected", requireAuth, handler);

// Permission-based
app.get("/users", requireAuth, requirePermissions({ users: ["read"] }), handler);

// Role-based
app.get("/admin", requireAuth, requireRole(["admin"]), handler);
```

### React Hooks

```typescript
import { useAuthPermissions } from "@/hooks/use-auth-permissions";

function MyComponent() {
  const {
    user,
    isAuthenticated,
    permissions,
    conditionalRender
  } = useAuthPermissions();

  return (
    <div>
      {permissions.canManageUsers && (
        <Button>Manage Users</Button>
      )}

      {conditionalRender(
        <Button>Delete Files</Button>,
        { files: ["delete"] },
        undefined,
        <p>Cannot delete files</p>
      )}
    </div>
  );
}
```

### Permission Guards

```typescript
import { AdminOnly, RequirePermissions } from "@/components/permission-guard";

function Dashboard() {
  return (
    <div>
      <AdminOnly fallback={<p>Admin only</p>}>
        <AdminPanel />
      </AdminOnly>

      <RequirePermissions
        permissions={{ projects: ["create"] }}
        fallback={<p>Cannot create projects</p>}
      >
        <CreateProjectButton />
      </RequirePermissions>
    </div>
  );
}
```

### Server-Side Permission Checking

```typescript
// Using Better Auth API
const hasPermission = await auth.api.userHasPermission({
  body: {
    userId: user.id,
    permissions: { projects: ["create"] },
  },
});

// Using local checking (faster)
import { hasPermission } from "@dolomys/auth";
const canCreate = hasPermission(user.role, { projects: ["create"] });
```

### Client-Side Permission Checking

```typescript
import { checkUserPermissions, checkRolePermissions } from "@/lib/auth-client";

// Check current user permissions
const canManage = await checkUserPermissions({ users: ["create", "update"] });

// Check role permissions
const adminCan = await checkRolePermissions(Role.Admin, { users: ["delete"] });
```

## API Reference

### Core Functions

- `hasPermission(userRole, permissions)` - Check if user has permissions
- `canAccess(userRole, resource, action)` - Check single resource access
- `isAdmin(userRole)` - Check if user is admin
- `isManagerOrAdmin(userRole)` - Check if user is manager or admin
- `shouldShowElement(userRole, permissions?, roles?)` - UI visibility helper

### React Hooks

- `useAuthPermissions()` - Main permission hook
- `useAdminPermissions()` - Admin-specific permissions
- `useManagerPermissions()` - Manager-specific permissions
- `useServerPermissions(permissions)` - Server-side permission checking
- `useConditionalRender(userRole)` - Conditional rendering helper

### Components

- `<PermissionGuard>` - Base permission guard component
- `<AdminOnly>` - Admin-only content wrapper
- `<ManagerOrAdminOnly>` - Manager/admin content wrapper
- `<RequirePermissions>` - Specific permission requirements

### Guards

Pre-built permission guards for common operations:

```typescript
import { guards } from "@dolomys/auth";

guards.canManageUsers(userRole);
guards.canViewProjects(userRole);
guards.canUploadFiles(userRole);
guards.isAdmin(userRole);
// ... and more
```

## Database Schema

Make sure your user table includes the admin plugin fields:

```sql
ALTER TABLE user ADD COLUMN role TEXT DEFAULT 'employee';
ALTER TABLE user ADD COLUMN banned BOOLEAN DEFAULT false;
ALTER TABLE user ADD COLUMN ban_reason TEXT;
ALTER TABLE user ADD COLUMN ban_expires TIMESTAMP;

ALTER TABLE session ADD COLUMN impersonated_by TEXT;
```

## Performance Optimization

### Local vs Server Checking

- **Local checking**: Fast, uses cached role permissions
- **Server checking**: Authoritative, uses Better Auth API

```typescript
// Fast local check
const canDelete = hasPermission(user.role, { files: ["delete"] });

// Authoritative server check
const canDelete = await auth.api.userHasPermission({
  body: { userId: user.id, permissions: { files: ["delete"] } },
});
```

### Caching

React Query is used for caching server-side permission checks:

```typescript
// Cached for 5 minutes
const { data: hasPermission } = useServerPermissions({ users: ["create"] });
```

## Migration Guide

If upgrading from a basic implementation:

1. Update your database schema with admin plugin fields
2. Replace manual permission checks with the provided utilities
3. Use the React hooks instead of manual session checking
4. Wrap components with permission guards instead of conditional rendering

## Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT
