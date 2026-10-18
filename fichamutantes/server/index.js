import { setTimeout } from "node:timers/promises";
import { createApp } from "./app.js";
import { createPool, initializeSchema } from "./db.js";

const pool = await createPool();
pool.on("error", error => console.error("Database connection error", { code: error.code }));
for (let attempt = 1; ; attempt++) {
  try {
    await initializeSchema(pool);
    break;
  } catch (error) {
    if (attempt >= 30) throw new Error("Database initialization failed", { cause: error.code });
    console.error("Waiting for database", { attempt });
    await setTimeout(1000);
  }
}
const app = createApp({
  pool,
  publicOrigin: process.env.PUBLIC_ORIGIN || "https://fichamutantes.nilvanlopes.com",
  authUrl: process.env.AUTHENTIK_AUTH_URL || "http://authentik-outpost-fichamutantes_proxy:9000/outpost.goauthentik.io/auth/traefik",
});
const server = app.listen(Number(process.env.PORT || 3000), "0.0.0.0", () => console.log("Ficha API listening"));
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => server.close(async () => { await pool.end(); process.exit(0); }));
}
