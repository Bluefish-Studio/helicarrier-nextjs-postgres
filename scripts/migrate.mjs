import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import pg from "pg";

export async function migrate(connectionString) {
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 5000, statement_timeout: 30000 });
  try {
    await client.connect();
    await client.query("BEGIN");
    // Serialize releases so overlapping deploys cannot apply the same migration twice.
    await client.query("SELECT pg_advisory_xact_lock(724021)");
    await client.query("CREATE TABLE IF NOT EXISTS guide_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
    const directory = new URL("../migrations/", import.meta.url);
    for (const name of (await readdir(directory)).filter(n => /^\d+_[\w-]+\.sql$/.test(n)).sort()) {
      const prior = await client.query("SELECT 1 FROM guide_migrations WHERE name = $1", [name]);
      if (prior.rowCount) continue;
      await client.query(await readFile(new URL(name, directory), "utf8"));
      await client.query("INSERT INTO guide_migrations (name) VALUES ($1)", [name]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end().catch(() => {});
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await migrate(process.env.DATABASE_URL);
    console.log("Database migrations applied. The launch board is ready.");
  } catch {
    console.error("Migration failed. Check database availability, DATABASE_URL, and the migration SQL. Connection details are withheld.");
    process.exitCode = 1;
  }
}
