import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import { statements } from "./statements";

// Merge our custom statements with Better Auth's default admin statements
const mergedStatements = {
	...defaultStatements,
	...statements,
} as const;

const ac = createAccessControl(mergedStatements);

export const access = ac;

export enum Role {
	Admin = "admin",
	Manager = "manager",
	Employee = "employee",
}

export const roles = {
	// Super admin with full access
	[Role.Admin]: ac.newRole({
		// Better Auth admin permissions
		...adminAc.statements,
		// Custom permissions
		users: ["read", "create", "update", "delete", "ban", "impersonate"],
		projects: ["read", "create", "update", "delete", "share"],
		files: ["read", "upload", "update", "delete"],
		session: ["read", "revoke", "delete"],
		analytics: ["read", "export"],
		settings: ["read", "update"],
	}),

	// Project manager with project and team management
	[Role.Manager]: ac.newRole({
		users: ["read"],
		projects: ["read", "create", "update", "delete", "share"],
		files: ["read", "upload", "update", "delete"],
		analytics: ["read"],
		settings: ["read"],
	}),

	// Regular employee with limited access
	[Role.Employee]: ac.newRole({
		users: ["read"],
		projects: ["read"],
		files: ["read", "upload"],
		analytics: ["read"],
	}),
};
