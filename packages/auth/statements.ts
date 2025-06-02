export const statements = {
	// User management
	users: ["read", "create", "update", "delete", "ban", "impersonate"],

	// Project management
	projects: ["read", "create", "update", "delete", "share"],

	// File management
	files: ["read", "upload", "update", "delete"],

	// Session management (singular to match Better Auth)
	session: ["read", "revoke", "delete"],

	// Analytics/Reports
	analytics: ["read", "export"],

	// Settings
	settings: ["read", "update"],
} as const;
