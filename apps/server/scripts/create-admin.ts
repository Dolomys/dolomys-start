#!/usr/bin/env tsx
import "dotenv/config";
import { createFirstAdmin } from "../src/lib/create-admin";
import * as readline from "readline";

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function questionHidden(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    let input = "";
    const onData = (char: string) => {
      if (char === "\r" || char === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");

        // Recreate readline interface after password input
        rl.close();
        rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        resolve(input);
      } else if (char === "\u0003") {
        // Ctrl+C
        process.exit(1);
      } else if (char === "\u007f") {
        // Backspace
        if (input.length > 0) {
          input = input.slice(0, -1);
          process.stdout.write("\b \b");
        }
      } else {
        input += char;
        process.stdout.write("*");
      }
    };

    process.stdin.on("data", onData);
  });
}

async function main() {
  console.log("🔧 Admin User Creation Tool\n");

  try {
    const email = await question("📧 Enter admin email: ");
    if (!email.trim()) {
      console.error("❌ Email is required");
      process.exit(1);
    }

    const password = await questionHidden("🔒 Enter admin password: ");
    if (!password.trim()) {
      console.error("❌ Password is required");
      process.exit(1);
    }

    const name = await question("👤 Enter admin name: ");
    if (!name.trim()) {
      console.error("❌ Name is required");
      process.exit(1);
    }

    console.log("\n⏳ Creating admin user...");
    await createFirstAdmin(email.trim(), password, name.trim());
    console.log("\n🎉 First admin user created successfully!");
    console.log("You can now sign in with these credentials and manage other users.");
  } catch (error) {
    console.error("\n💥 Failed to create admin user:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
