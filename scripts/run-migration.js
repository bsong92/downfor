import fetch from "node-fetch";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

async function runMigration() {
  const sql = `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;`;

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

    console.log("✓ Migration applied successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    console.log("\nManual migration: Run this in Supabase SQL Editor:");
    console.log("  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;");
    process.exit(1);
  }
}

runMigration();
