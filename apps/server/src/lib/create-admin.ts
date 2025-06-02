import { Role } from "@dolomys/auth";
import { auth } from "./auth";

/**
 * Utility to create the first admin user
 * Run this once to bootstrap your application with an admin
 */
export async function createFirstAdmin(
	email: string,
	password: string,
	name: string,
) {
	try {
		// Create the user
		const user = await auth.api.signUpEmail({
			body: {
				email,
				password,
				name,
			},
		});

		if (!user) {
			throw new Error("Failed to create user");
		}

		// Set the user role to admin using Better Auth's admin API
		const adminUser = await auth.api.setRole({
			body: {
				userId: user.user.id,
				role: Role.Admin,
			},
		});

		console.log("✅ Admin user created successfully:", {
			id: adminUser.user.id,
			email: adminUser.user.email,
			name: adminUser.user.name,
			role: adminUser.user.role,
		});

		return adminUser;
	} catch (error) {
		console.error("❌ Failed to create admin user:", error);
		throw error;
	}
}

/**
 * Utility to promote an existing user to admin
 */
export async function promoteToAdmin(userId: string) {
	try {
		const adminUser = await auth.api.setRole({
			body: {
				userId,
				role: Role.Admin,
			},
		});

		console.log("✅ User promoted to admin:", {
			id: adminUser.user.id,
			email: adminUser.user.email,
			role: adminUser.user.role,
		});

		return adminUser;
	} catch (error) {
		console.error("❌ Failed to promote user to admin:", error);
		throw error;
	}
}

/**
 * Utility to set any role for a user
 */
export async function setUserRole(userId: string, role: Role) {
	try {
		const updatedUser = await auth.api.setRole({
			body: {
				userId,
				role,
			},
		});

		console.log("✅ User role updated:", {
			id: updatedUser.user.id,
			email: updatedUser.user.email,
			role: updatedUser.user.role,
		});

		return updatedUser;
	} catch (error) {
		console.error("❌ Failed to update user role:", error);
		throw error;
	}
}
