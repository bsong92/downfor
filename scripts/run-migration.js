const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const migrationPath = process.argv[2];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

if (!migrationPath) {
  console.error("Usage: node scripts/run-migration.js <path-to-sql>");
  process.exit(1);
}

const sql = readFileSync(resolve(migrationPath), "utf8");

async function runMigration() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${supabaseKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    console.log(`✓ Migration applied successfully: ${migrationPath}`);
  } catch (error) {
    console.error("Migration failed:", error);
    console.log("\nManual migration: Run this SQL in Supabase SQL Editor:");
    console.log(sql);
    process.exit(1);
  }
}

runMigration();
