import { readFile } from "node:fs/promises";
import pg from "pg";

export async function createPool(env = process.env) {
  const password = env.DB_PASSWORD_FILE
    ? (await readFile(env.DB_PASSWORD_FILE, "utf8")).trim()
    : env.DB_PASSWORD;
  if (!password) throw new Error("Database credentials are required");
  return new pg.Pool({
    host: env.DB_HOST || "postgres",
    port: Number(env.DB_PORT || 5432),
    database: env.DB_NAME || "fichamutantes",
    user: env.DB_USER || "fichamutantes",
    password,
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  });
}

export async function initializeSchema(pool) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(74932001)");
    await client.query(await readFile(new URL("./schema.sql", import.meta.url), "utf8"));
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
