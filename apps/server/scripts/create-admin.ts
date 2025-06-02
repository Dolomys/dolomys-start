#!/usr/bin/env tsx
import "dotenv/config";
import { createFirstAdmin } from "../src/lib/create-admin";

async function main() {
	const args = process.argv.slice(2);

	if (args.length < 3) {
		console.log("Usage: tsx scripts/create-admin.ts <email> <password> <name>");
		console.log(
			"Example: tsx scripts/create-admin.ts admin@company.com securepassword123 'Admin User'",
		);
		process.exit(1);
	}

	const [email, password, name] = args;

	try {
		await createFirstAdmin(email, password, name);
		console.log("\n🎉 First admin user created successfully!");
		console.log(
			"You can now sign in with these credentials and manage other users.",
		);
	} catch (error) {
		console.error("\n💥 Failed to create admin user:", error);
		process.exit(1);
	}
}

main();
