import { readFileSync } from "fs";
import { resolve } from "path";
import bcrypt from "bcryptjs";
import { createClient, ENSURE_TABLES } from "../lib/db";

// Load .env.local
const envPath = resolve(__dirname, "../.env.local");
try {
  const envFile = readFileSync(envPath, "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const val = trimmed.slice(eqIdx + 1).replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env.local not found
}

const DEMO_PASSWORD = "demo1234";

const demoUsers = [
  { name: "Manager Demo", email: "manager@revpool.io", role: "manager", participantId: null },
  { name: "Sarah Chen", email: "sarah@revpool.io", role: "rep", participantId: 1 },
  { name: "James Park", email: "james@revpool.io", role: "rep", participantId: 2 },
  { name: "Alex Rivera", email: "alex@revpool.io", role: "rep", participantId: 3 },
  { name: "Marcus Johnson", email: "marcus@revpool.io", role: "rep", participantId: 4 },
  { name: "Emily Watson", email: "emily@revpool.io", role: "rep", participantId: 5 },
  { name: "Lisa Morgan", email: "lisa@revpool.io", role: "rep", participantId: 6 },
];

async function seedUsers() {
  const client = createClient();
  await client.connect();

  try {
    await client.query(ENSURE_TABLES);

    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

    for (const user of demoUsers) {
      const existing = await client.query("SELECT id FROM users WHERE email = $1", [user.email]);
      if (existing.rows.length > 0) {
        console.log(`  Skipping ${user.email} (already exists)`);
        continue;
      }
      await client.query(
        `INSERT INTO users (name, email, password_hash, role, participant_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.name, user.email, hash, user.role, user.participantId]
      );
      console.log(`  Created ${user.email} (${user.role})`);
    }

    console.log("\nSeed users complete!");
    console.log(`  Password for all accounts: ${DEMO_PASSWORD}`);
  } finally {
    await client.end();
  }
}

seedUsers().catch((err) => {
  console.error("Seed users failed:", err);
  process.exit(1);
});
