import { Hono } from "hono";
import {
	checkUserPermission,
	getCurrentUser,
	requireAdmin,
	requireAuth,
	requirePermissions,
	requireRole,
} from "../lib/rbac-middleware";

const app = new Hono();

// Public route - no auth required
app.get("/public", (c) => {
	return c.json({ message: "This is a public endpoint" });
});

// Protected route - requires authentication
app.get("/profile", requireAuth, (c) => {
	const user = getCurrentUser(c);
	return c.json({ user });
});

// Admin only route
app.get("/admin/dashboard", requireAuth, requireAdmin, (c) => {
	return c.json({ message: "Admin dashboard data" });
});

// Role-based route - managers and admins only
app.get(
	"/management/reports",
	requireAuth,
	requireRole(["admin", "manager"]),
	(c) => {
		return c.json({ message: "Management reports" });
	},
);

// Permission-based routes
app.get("/users", requireAuth, requirePermissions({ users: ["read"] }), (c) => {
	return c.json({ message: "List of users" });
});

app.post(
	"/users",
	requireAuth,
	requirePermissions({ users: ["create"] }),
	(c) => {
		return c.json({ message: "User created" });
	},
);

app.delete(
	"/users/:id",
	requireAuth,
	requirePermissions({ users: ["delete"] }),
	(c) => {
		const userId = c.req.param("id");
		return c.json({ message: `User ${userId} deleted` });
	},
);

// Project management routes
app.get(
	"/projects",
	requireAuth,
	requirePermissions({ projects: ["read"] }),
	(c) => {
		return c.json({ message: "List of projects" });
	},
);

app.post(
	"/projects",
	requireAuth,
	requirePermissions({ projects: ["create"] }),
	(c) => {
		return c.json({ message: "Project created" });
	},
);

// File management routes
app.post(
	"/files/upload",
	requireAuth,
	requirePermissions({ files: ["upload"] }),
	(c) => {
		return c.json({ message: "File uploaded" });
	},
);

app.delete(
	"/files/:id",
	requireAuth,
	requirePermissions({ files: ["delete"] }),
	(c) => {
		const fileId = c.req.param("id");
		return c.json({ message: `File ${fileId} deleted` });
	},
);

// Conditional permission check within route
app.get("/conditional", requireAuth, (c) => {
	const user = getCurrentUser(c);

	// Check permissions dynamically
	const canManageUsers = checkUserPermission(c, {
		users: ["create", "update", "delete"],
	});
	const canViewAnalytics = checkUserPermission(c, { analytics: ["read"] });

	return c.json({
		user: user?.name,
		permissions: {
			canManageUsers,
			canViewAnalytics,
		},
	});
});

export default app;
