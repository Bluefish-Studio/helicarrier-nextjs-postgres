import test from "node:test";
import assert from "node:assert/strict";
import pg from "pg";
import { migrate } from "../scripts/migrate.mjs";

const connectionString = process.env.TEST_DATABASE_URL;
// Tests must explicitly target the disposable local guide DB. No fallback to an app URL.
if (!connectionString) throw new Error("Set TEST_DATABASE_URL to the disposable local guide database");
const target = new URL(connectionString);
if (!["localhost", "127.0.0.1"].includes(target.hostname) || target.pathname !== "/helicarrier_guide")
  throw new Error("Tests require the disposable local helicarrier_guide database");

test("overlapping and repeated migrations create one schema and preserve seeded data", async () => {
  await Promise.all([migrate(connectionString), migrate(connectionString)]);
  await migrate(connectionString);
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    const records = await client.query("SELECT title FROM guide_launches ORDER BY id");
    assert.equal(records.rowCount, 4);
    assert.equal(records.rows[0].title, "Give the idea a home");
    const migrations = await client.query("SELECT name FROM guide_migrations");
    assert.deepEqual(migrations.rows, [{ name: "001_launch_board.sql" }]);
  } finally { await client.end(); }
});
