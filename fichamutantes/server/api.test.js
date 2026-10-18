import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { createServer } from "node:http";
import { once } from "node:events";
import { createApp } from "./app.js";
import { createPool, initializeSchema } from "./db.js";

if (process.env.DB_NAME !== "fichamutantes_test") throw new Error("Use a dedicated fichamutantes_test database");
const origin = "https://fichamutantes.nilvanlopes.com";
const uidA = "a".repeat(64), uidB = "b".repeat(64);
let pool, auth, server, base;
let usernameA = "pyu";

before(async () => {
  pool = await createPool();
  await initializeSchema(pool);
  await initializeSchema(pool);
  await pool.query("TRUNCATE sheets, accounts");
  auth = createServer((req, res) => {
    const cookie = req.headers.cookie;
    assert.equal(req.headers["x-forwarded-host"], "fichamutantes.nilvanlopes.com");
    if (cookie === "session=broken") { res.writeHead(503); return res.end(); }
    if (!["session=A", "session=B", "session=outsider"].includes(cookie)) { res.writeHead(302, { Location: origin }); return res.end(); }
    res.writeHead(200, {
      "X-authentik-uid": cookie === "session=A" ? uidA : uidB,
      "X-authentik-username": cookie === "session=A" ? usernameA : "player-b",
      "X-authentik-groups": cookie === "session=outsider" ? "foundry-users" : "fichamutantes",
    });
    res.end();
  }).listen(0, "127.0.0.1");
  await once(auth, "listening");
  server = createApp({ pool, publicOrigin: origin, authUrl: `http://127.0.0.1:${auth.address().port}` }).listen(0, "127.0.0.1");
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (auth) await new Promise(resolve => auth.close(resolve));
  await pool?.end();
});

function get(user = "A", path = "/api/sheet", headers = {}) {
  return fetch(base + path, { headers: { Cookie: `session=${user}`, ...headers } });
}
function put(user, form, revision, overrides = {}) {
  return fetch(base + "/api/sheet", {
    method: "PUT",
    headers: { Cookie: `session=${user}`, Origin: origin, "X-Ficha-Request": "1",
      "X-Ficha-Account": user === "A" ? uidA : uidB, "Content-Type": "application/json", ...overrides },
    body: JSON.stringify({ form, revision }),
  });
}

test("forged identity headers cannot authenticate a request", async () => {
  const response = await fetch(base + "/api/sheet", { headers: { "X-authentik-uid": uidA, "X-authentik-username": "pyu" } });
  assert.equal(response.status, 401);
  assert.equal((await pool.query("SELECT count(*) FROM accounts")).rows[0].count, "0");
});
test("first visit loads an empty sheet for each authenticated account", async () => {
  for (const user of ["A", "B"]) {
    const response = await get(user);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.deepEqual((await response.json()).sheet, { form: {}, revision: 0, updatedAt: null, exists: false });
  }
});
test("two accounts save and read independent records", async () => {
  assert.equal((await put("A", { "nome-personagem": "Personagem A", ferido: true }, 0)).status, 200);
  assert.equal((await put("B", { "nome-personagem": "Personagem B" }, 0)).status, 200);
  assert.equal((await (await get("A")).json()).sheet.form["nome-personagem"], "Personagem A");
  assert.equal((await (await get("B")).json()).sheet.form["nome-personagem"], "Personagem B");
});
test("spoofed headers and owner query parameters do not select another account", async () => {
  const data = await (await get("A", `/api/sheet?owner_uid=${uidB}`, { "X-authentik-uid": uidB, "X-authentik-username": "player-b" })).json();
  assert.equal(data.user.uid, uidA);
  assert.equal(data.sheet.form["nome-personagem"], "Personagem A");
  const response = await fetch(base + "/api/sheet", { method: "PUT", headers: {
    Cookie: "session=A", Origin: origin, "X-Ficha-Request": "1", "X-Ficha-Account": uidA, "Content-Type": "application/json",
  }, body: JSON.stringify({ form: {}, revision: 1, owner_uid: uidB }) });
  assert.equal(response.status, 400);
});
test("switching accounts while a tab is open cannot save the old sheet into the new account", async () => {
  const response = await put("B", { "nome-personagem": "Vazamento A" }, 1, { "X-Ficha-Account": uidA });
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, "ACCOUNT_CHANGED");
  assert.equal((await (await get("B")).json()).sheet.form["nome-personagem"], "Personagem B");
});
test("optimistic concurrency prevents stale tabs from overwriting newer changes", async () => {
  assert.equal((await put("A", { "nome-personagem": "A atualizado" }, 1)).status, 200);
  const response = await put("A", { "nome-personagem": "A antigo" }, 1);
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, "SHEET_CONFLICT");
  assert.equal((await (await get("A")).json()).sheet.form["nome-personagem"], "A atualizado");
  assert.equal((await put("A", {}, 0)).status, 409);
});
test("cross-origin writes and forms without the application header are rejected", async () => {
  assert.equal((await put("A", {}, 2, { Origin: "https://other.example" })).status, 403);
  assert.equal((await put("A", {}, 2, { Origin: "" })).status, 403);
  assert.equal((await put("A", {}, 2, { "X-Ficha-Request": "" })).status, 403);
});
test("membership in another application group does not grant access", async () => {
  assert.equal((await get("outsider")).status, 403);
  assert.equal((await get("invalid-session")).status, 401);
  assert.equal((await get("broken")).status, 503);
});
test("malformed and oversized sheet data is rejected", async () => {
  for (const form of [[], { invalid: {} }, { invalid: "x".repeat(16001) }, { constructor: "bad" }, { "bad_key": "bad" }]) {
    assert.equal((await put("A", form, 2)).status, 400);
  }
  assert.equal((await put("A", { text: "x".repeat(600000) }, 2)).status, 413);
});
test("clearing a sheet persists an empty object without reseeding it", async () => {
  assert.equal((await put("A", {}, 2)).status, 200);
  const { sheet } = await (await get("A")).json();
  assert.deepEqual(sheet.form, {});
  assert.equal(sheet.exists, true);
});
test("stable Authentik UID retains data when a username changes", async () => {
  usernameA = "renamed-user";
  const { user, sheet } = await (await get("A")).json();
  assert.equal(user.uid, uidA);
  assert.equal(user.username, "renamed-user");
  assert.equal(sheet.revision, 3);
});
test("schema initialization and API restart preserve persisted data", async () => {
  await new Promise(resolve => server.close(resolve));
  await initializeSchema(pool);
  server = createApp({ pool, publicOrigin: origin, authUrl: `http://127.0.0.1:${auth.address().port}` }).listen(0, "127.0.0.1");
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await (await get("B")).json()).sheet.form["nome-personagem"], "Personagem B");
});
