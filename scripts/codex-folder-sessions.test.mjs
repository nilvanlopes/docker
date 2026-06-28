import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

import {
  loadConversationText,
  loadThreads,
  parseArgs,
  rowMatchesQuery,
  selectedIndexAfterKey,
} from "./codex-folder-sessions.mjs";

function writeJsonl(file, entries) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${entries.map((entry) => JSON.stringify(entry)).join("\n")}\n`);
}

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-sessions-test-"));
  const folderA = path.join(root, "project-a");
  const folderB = path.join(root, "project-b");
  fs.mkdirSync(folderA);
  fs.mkdirSync(folderB);

  const rolloutA = path.join(root, "sessions", "2026", "06", "10", "session-a.jsonl");
  const rolloutB = path.join(root, "sessions", "2026", "06", "10", "session-b.jsonl");
  writeJsonl(rolloutA, [
    { type: "event_msg", payload: { type: "user_message", message: "hidden search phrase" } },
    { type: "event_msg", payload: { type: "agent_message", message: "visible response" } },
  ]);
  writeJsonl(rolloutB, [
    {
      type: "response_item",
      payload: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: "legacy conversation text" }],
      },
    },
  ]);

  const db = new DatabaseSync(path.join(root, "state_5.sqlite"));
  db.exec(`
    create table threads (
      id text primary key,
      rollout_path text,
      created_at integer,
      updated_at integer,
      cwd text,
      title text,
      git_branch text,
      archived integer
    )
  `);
  const insert = db.prepare(`
    insert into threads
      (id, rollout_path, created_at, updated_at, cwd, title, git_branch, archived)
    values (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run("session-a", rolloutA, 100, 200, folderA, "Alpha title", "main", 0);
  insert.run("session-b", rolloutB, 90, 190, folderB, "Beta title", "feature", 0);
  insert.run("archived", rolloutB, 80, 180, folderB, "Archived title", "old", 1);
  db.close();

  return { root, folderA, folderB, rolloutA, rolloutB };
}

test("parseArgs accepts all and rejects all with --cwd", () => {
  const local = parseArgs([]);
  assert.equal(local.cwd, process.cwd());

  const all = parseArgs(["all"]);
  assert.equal(all.all, true);
  assert.throws(() => parseArgs(["all", "--cwd", "/tmp"]), /Cannot combine all with --cwd/);
});

test("loadConversationText indexes visible events and ignores tool output", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-conversation-test-"));
  const rollout = path.join(root, "rollout.jsonl");
  writeJsonl(rollout, [
    { type: "event_msg", payload: { type: "user_message", message: "Needle From User" } },
    { type: "event_msg", payload: { type: "agent_message", message: "Needle From Codex" } },
    { type: "response_item", payload: { type: "function_call_output", output: "tool-only needle" } },
    { invalid: true },
  ]);

  try {
    const text = await loadConversationText(rollout);
    assert.match(text, /needle from user/);
    assert.match(text, /needle from codex/);
    assert.doesNotMatch(text, /tool-only/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("loadConversationText falls back to legacy response messages", async () => {
  const fixture = createFixture();
  try {
    assert.equal(await loadConversationText(fixture.rolloutB), "legacy conversation text");
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rowMatchesQuery searches metadata and conversation content", () => {
  const row = {
    id: "session-id",
    cwd: "/work/project",
    title: "Unrelated title",
    branch: "feature/example",
    conversationText: "the requested internal phrase appears here",
  };

  assert.equal(rowMatchesQuery(row, "INTERNAL PHRASE"), true);
  assert.equal(rowMatchesQuery(row, "feature/example"), true);
  assert.equal(rowMatchesQuery(row, "/work/project"), true);
  assert.equal(rowMatchesQuery(row, "missing phrase"), false);
});

test("selectedIndexAfterKey supports arrows during search without vim keys", () => {
  assert.equal(selectedIndexAfterKey("\u001b[B", 0, 3, { vimKeys: false }), 1);
  assert.equal(selectedIndexAfterKey("\u001b[A", 1, 3, { vimKeys: false }), 0);
  assert.equal(selectedIndexAfterKey("\u001b[6~", 0, 12, { vimKeys: false }), 10);
  assert.equal(selectedIndexAfterKey("\u001b[F", 0, 3, { vimKeys: false }), 2);
  assert.equal(selectedIndexAfterKey("j", 0, 3, { vimKeys: false }), null);
  assert.equal(selectedIndexAfterKey("k", 1, 3, { vimKeys: false }), null);
});

test("selectedIndexAfterKey keeps vim navigation outside search", () => {
  assert.equal(selectedIndexAfterKey("j", 0, 3), 1);
  assert.equal(selectedIndexAfterKey("k", 1, 3), 0);
});

test("loadThreads scopes by cwd and all lists every active folder", () => {
  const fixture = createFixture();
  try {
    const stateDb = path.join(fixture.root, "state_5.sqlite");
    const local = loadThreads({ cwd: fixture.folderA }, stateDb);
    assert.deepEqual(local.map((row) => row.title), ["Alpha title"]);

    const all = loadThreads({ cwd: fixture.folderA, all: true }, stateDb);
    assert.deepEqual(all.map((row) => row.title), ["Alpha title", "Beta title"]);
    assert.deepEqual(all.map((row) => row.cwd), [fixture.folderA, fixture.folderB]);
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});
