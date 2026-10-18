import express from "express";

function validForm(form) {
  if (!form || typeof form !== "object" || Array.isArray(form)) return false;
  const entries = Object.entries(form);
  return entries.length <= 2000 && entries.every(([key, value]) =>
    /^[a-z][a-z0-9-]{0,119}$/.test(key) &&
    !["constructor", "prototype"].includes(key) &&
    ((typeof value === "string" && value.length <= 16000) ||
      typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))),
  );
}

export function createApp({ pool, authUrl, publicOrigin, fetchAuth = fetch }) {
  const app = express();
  const origin = new URL(publicOrigin).origin;
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.set({ "Cache-Control": "no-store", Vary: "Cookie", "X-Content-Type-Options": "nosniff" });
    next();
  });
  app.get("/healthz", async (req, res) => {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  });

  app.use("/api", async (req, res, next) => {
    if (!["GET", "HEAD"].includes(req.method) &&
        (req.get("Origin") !== origin || req.get("X-Ficha-Request") !== "1")) {
      return res.status(403).json({ error: "INVALID_ORIGIN" });
    }
    if (process.env.DEV_AUTH_BYPASS === "1") {
      const username = process.env.DEV_AUTH_USERNAME || "pyu";
      const { rows } = await pool.query(
        "SELECT uid, username, display_name FROM accounts WHERE username = $1 ORDER BY last_seen DESC LIMIT 1",
        [username],
      );
      if (!rows.length) return res.status(503).json({ error: "DEV_ACCOUNT_NOT_FOUND" });
      req.account = { uid: rows[0].uid, username: rows[0].username, name: rows[0].display_name || username };
    } else {
      if (!req.get("Cookie")) return res.status(401).json({ error: "LOGIN_REQUIRED" });
      let auth;
      try {
        // A identidade vem de uma nova validação da sessão no outpost.
        // Nunca usamos os headers de identidade enviados pelo navegador.
        auth = await fetchAuth(authUrl, {
          redirect: "manual",
          signal: AbortSignal.timeout(5000),
          headers: {
            Cookie: req.get("Cookie"),
            "X-Forwarded-Host": new URL(origin).host,
            "X-Forwarded-Proto": new URL(origin).protocol.slice(0, -1),
            "X-Forwarded-Uri": req.originalUrl,
            "X-Forwarded-Method": req.method,
            "X-Original-URL": new URL(req.originalUrl, origin).href,
          },
        });
      } catch {
        return res.status(503).json({ error: "AUTH_UNAVAILABLE" });
      }
      await auth.body?.cancel();
      if (!auth.ok) {
        const denied = auth.status === 403;
        return res.status(denied ? 403 : auth.status >= 500 ? 503 : 401)
          .json({ error: denied ? "ACCESS_DENIED" : auth.status >= 500 ? "AUTH_UNAVAILABLE" : "LOGIN_REQUIRED" });
      }
      const uid = auth.headers.get("X-authentik-uid") || "";
      const username = auth.headers.get("X-authentik-username") || "";
      const groups = (auth.headers.get("X-authentik-groups") || "").split("|");
      if (!/^[a-f0-9]{64}$/.test(uid) || !username || !groups.includes("fichamutantes")) {
        return res.status(403).json({ error: "ACCESS_DENIED" });
      }
      req.account = { uid, username, name: auth.headers.get("X-authentik-name") || username };
    }
    await pool.query(`INSERT INTO accounts (uid, username, display_name) VALUES ($1, $2, $3)
      ON CONFLICT (uid) DO UPDATE SET username = EXCLUDED.username,
      display_name = EXCLUDED.display_name, last_seen = now()`, [req.account.uid, req.account.username, req.account.name]);
    next();
  });

  app.get("/api/session", (req, res) => res.json({ user: req.account }));
  app.get("/api/sheet", async (req, res) => {
    const { rows } = await pool.query("SELECT form, revision, updated_at FROM sheets WHERE owner_uid = $1", [req.account.uid]);
    const sheet = rows[0];
    res.json({
      user: req.account,
      sheet: sheet ? { form: sheet.form, revision: sheet.revision, updatedAt: sheet.updated_at, exists: true }
        : { form: {}, revision: 0, updatedAt: null, exists: false },
    });
  });

  app.put("/api/sheet", express.json({ limit: "512kb", type: "application/json" }), async (req, res) => {
    if (req.get("X-Ficha-Account") !== req.account.uid) {
      return res.status(409).json({ error: "ACCOUNT_CHANGED" });
    }
    const { form, revision } = req.body || {};
    if (!validForm(form) || !Number.isInteger(revision) || revision < 0 || revision >= 2147483647 ||
        Object.keys(req.body).some(key => !["form", "revision"].includes(key))) {
      return res.status(400).json({ error: "INVALID_SHEET" });
    }
    // A conta é sempre a confirmada pelo outpost; nenhum ID do corpo seleciona registros.
    const args = [req.account.uid, JSON.stringify(form)];
    const { rows } = revision === 0
      ? await pool.query(`INSERT INTO sheets (owner_uid, form) VALUES ($1, $2::jsonb)
          ON CONFLICT (owner_uid) DO NOTHING RETURNING revision, updated_at`, args)
      : await pool.query(`UPDATE sheets SET form = $2::jsonb, revision = revision + 1, updated_at = now()
          WHERE owner_uid = $1 AND revision = $3 RETURNING revision, updated_at`, [...args, revision]);
    if (!rows.length) return res.status(409).json({ error: "SHEET_CONFLICT" });
    res.json({ revision: rows[0].revision, updatedAt: rows[0].updated_at });
  });

  app.use((req, res) => res.status(404).json({ error: "NOT_FOUND" }));
  app.use((error, req, res, next) => {
    if (error.type === "entity.too.large") return res.status(413).json({ error: "SHEET_TOO_LARGE" });
    if (error.type === "entity.parse.failed") return res.status(400).json({ error: "INVALID_JSON" });
    console.error("API request failed", { code: error.code || "INTERNAL_ERROR" });
    res.status(503).json({ error: "DATABASE_UNAVAILABLE" });
  });
  return app;
}
