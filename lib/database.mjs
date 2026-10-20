import pg from "pg";

let pool;
export function database() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      query_timeout: 5000,
      statement_timeout: 5000,
    });
    // Never log a connection error object: it can contain connection details.
    pool.on("error", () => console.error("An idle database connection closed; the pool will reconnect."));
  }
  return pool;
}

export async function readBoard() {
  const { rows } = await database().query("SELECT id, title, category, state FROM guide_launches ORDER BY id");
  return rows;
}
