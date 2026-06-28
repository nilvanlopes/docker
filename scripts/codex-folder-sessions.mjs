#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import readline from "node:readline";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const HOME = os.homedir();
const CODEX_HOME = process.env.CODEX_HOME || path.join(HOME, ".codex");
const STATE_DB = path.join(CODEX_HOME, "state_5.sqlite");
const HISTORY = path.join(CODEX_HOME, "history.jsonl");
const SESSIONS_DIR = path.join(CODEX_HOME, "sessions");
const BACKUP_DIR = path.join(CODEX_HOME, "session-delete-backups");

const HELP = [
  "enter resume",
  "delete/d delete",
  "/ search",
  "tab sort",
  "q quit",
].join("   ");

const state = {
  rows: [],
  filtered: [],
  selected: 0,
  offset: 0,
  sort: "updated",
  query: "",
  message: "",
  confirmingDelete: null,
  searching: false,
};

function usage() {
  console.log(`Usage:
  codex sessions all
  codex sessions [--cwd <path>]
  codex sessions [all | --cwd <path>] --dry-run-delete <session_id>

Environment:
  CODEX_HOME defaults to ~/.codex`);
}

function parseArgs(argv) {
  const args = {
    cwd: process.cwd(),
    all: false,
    cwdProvided: false,
    dryRunDelete: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "all") {
      if (args.all) throw new Error("The all argument may only be provided once");
      args.all = true;
    } else if (arg === "--cwd") {
      if (i + 1 >= argv.length) throw new Error("--cwd requires a path");
      args.cwd = argv[++i];
      args.cwdProvided = true;
    } else if (arg === "--dry-run-delete") {
      if (i + 1 >= argv.length) throw new Error("--dry-run-delete requires a session id");
      args.dryRunDelete = argv[++i];
    } else if (arg === "-h" || arg === "--help") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (args.all && args.cwdProvided) {
    throw new Error("Cannot combine all with --cwd");
  }
  args.cwd = path.resolve(args.cwd);
  return args;
}

function ensureReadableCodexHome(stateDb = STATE_DB) {
  if (!fs.existsSync(stateDb)) {
    throw new Error(`Codex state DB not found: ${stateDb}`);
  }
}

function openDb(readOnly = false, stateDb = STATE_DB) {
  return readOnly ? new DatabaseSync(stateDb, { readOnly: true }) : new DatabaseSync(stateDb);
}

function loadThreads({ cwd, all = false }, stateDb = STATE_DB) {
  ensureReadableCodexHome(stateDb);
  const db = openDb(true, stateDb);
  try {
    const where = all ? "archived = 0" : "cwd = ? and archived = 0";
    const statement = db.prepare(
      `select id, rollout_path, created_at, updated_at, cwd, title, git_branch, archived
       from threads
       where ${where}
       order by updated_at desc`,
    );
    return (all ? statement.all() : statement.all(cwd))
      .map((row) => ({
        id: row.id,
        rolloutPath: row.rollout_path,
        createdAt: Number(row.created_at || 0),
        updatedAt: Number(row.updated_at || 0),
        cwd: row.cwd,
        title: row.title || "(untitled)",
        branch: row.git_branch || "",
        conversationText: "",
      }));
  } finally {
    db.close();
  }
}

function formatAge(seconds) {
  const delta = Math.max(0, Math.floor(Date.now() / 1000) - Number(seconds || 0));
  if (delta < 60) return "now";
  const mins = Math.floor(delta / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function singleLine(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function clip(text, width) {
  const value = String(text || "");
  if (width <= 1) return "";
  if (width <= 3) return value.slice(0, width);
  return value.length > width ? `${value.slice(0, width - 3)}...` : value;
}

function clipCell(text, width) {
  return clip(singleLine(text), width);
}

function rowMatchesQuery(row, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return [row.title, row.branch, row.id, row.cwd, row.conversationText].some((value) =>
    String(value || "").toLowerCase().includes(normalizedQuery),
  );
}

function applyFilter() {
  const query = state.query.trim().toLowerCase();
  let rows = state.rows;
  if (query) {
    rows = rows.filter((row) => rowMatchesQuery(row, query));
  }

  const key = state.sort === "created" ? "createdAt" : "updatedAt";
  state.filtered = [...rows].sort((a, b) => b[key] - a[key]);
  state.selected = Math.min(state.selected, Math.max(0, state.filtered.length - 1));
  clampOffset();
}

function terminalSize() {
  return {
    width: process.stdout.columns || 100,
    height: process.stdout.rows || 30,
  };
}

function clampOffset() {
  const { height } = terminalSize();
  const bodyHeight = Math.max(1, height - 5);
  if (state.selected < state.offset) state.offset = state.selected;
  if (state.selected >= state.offset + bodyHeight) {
    state.offset = state.selected - bodyHeight + 1;
  }
  state.offset = Math.max(0, Math.min(state.offset, Math.max(0, state.filtered.length - 1)));
}

function selectedIndexAfterKey(key, selected, count, { vimKeys = true } = {}) {
  const last = Math.max(0, count - 1);
  if (count <= 0) return 0;
  if (key === "\u001b[A" || key === "mouse-up" || (vimKeys && key === "k")) {
    return Math.max(0, selected - 1);
  }
  if (key === "\u001b[B" || key === "mouse-down" || (vimKeys && key === "j")) {
    return Math.min(last, selected + 1);
  }
  if (key === "\u001b[5~") return Math.max(0, selected - 10);
  if (key === "\u001b[6~") return Math.min(last, selected + 10);
  if (key === "\u001b[H" || key === "\u001b[1~") return 0;
  if (key === "\u001b[F" || key === "\u001b[4~") return last;
  return null;
}

function moveSelectionForKey(key, options) {
  const next = selectedIndexAfterKey(key, state.selected, state.filtered.length, options);
  if (next === null) return false;
  state.selected = next;
  return true;
}

function render({ cwd, all }) {
  const { width, height } = terminalSize();
  const markerWidth = 2;
  const gap = 2;
  const createdWidth = width < 70 ? 12 : 15;
  const updatedWidth = width < 70 ? 12 : 15;
  const folderWidth = all ? Math.min(30, Math.max(14, Math.floor(width * 0.22))) : 0;
  const branchWidth = width < (all ? 115 : 80)
    ? 0
    : Math.min(18, Math.max(10, Math.floor(width * 0.14)));
  const optionalColumns = Number(folderWidth > 0) + Number(branchWidth > 0);
  const gapsWidth = gap * (2 + optionalColumns);
  const titleWidth = Math.max(
    12,
    width - markerWidth - createdWidth - updatedWidth - folderWidth - branchWidth - gapsWidth,
  );
  const bodyHeight = Math.max(1, height - 5);

  const lines = [];
  const pad = (text, cellWidth) => clipCell(text, cellWidth).padEnd(cellWidth);
  const rowLine = ({ marker = "", created = "", updated = "", folder = "", branch = "", title = "" }) => {
    const cells = [
      marker.padEnd(markerWidth),
      pad(created, createdWidth),
      pad(updated, updatedWidth),
    ];
    if (folderWidth > 0) cells.push(pad(folder, folderWidth));
    if (branchWidth > 0) cells.push(pad(branch, branchWidth));
    cells.push(clipCell(title, titleWidth));
    return cells.join(" ".repeat(gap));
  };

  const sortLabel = state.sort[0].toUpperCase() + state.sort.slice(1);
  const scopeLabel = all ? "all folders" : cwd;
  lines.push(`Codex sessions for ${scopeLabel}   Sort: ${sortLabel}`);
  if (state.searching) lines.push(`Search: ${state.query}_`);
  else lines.push(state.query ? `Search: ${state.query}` : "Type / to search");
  lines.push(rowLine({
    created: "Created",
    updated: "Updated",
    folder: "Folder",
    branch: "Branch",
    title: "Conversation",
  }));

  const visible = state.filtered.slice(state.offset, state.offset + bodyHeight);
  for (let i = 0; i < visible.length; i += 1) {
    const absoluteIndex = state.offset + i;
    const row = visible[i];
    const marker = absoluteIndex === state.selected ? "> " : "  ";
    lines.push(rowLine({
      marker,
      created: formatAge(row.createdAt),
      updated: formatAge(row.updatedAt),
      folder: row.cwd,
      branch: row.branch,
      title: row.title,
    }));
  }

  const blankLines = bodyHeight - visible.length;
  for (let i = 0; i < blankLines; i += 1) lines.push("");

  lines.push(HELP);
  if (state.confirmingDelete) {
    lines.push(
      clipCell(`Delete "${state.confirmingDelete.title}"? y/N`, width),
    );
  } else {
    lines.push(state.message ? clipCell(state.message, width) : `${state.filtered.length} session(s)`);
  }

  process.stdout.write(`\x1b[H\x1b[2J${lines.map((line) => clip(line, width)).join("\n")}`);
}

function parseKeys(chunk) {
  const text = chunk.toString("utf8");
  const keys = [];
  if (text === "\u001b") return ["\u001b"];

  for (let i = 0; i < text.length; i += 1) {
    const mouse = text.slice(i).match(/^\u001b\[<(\d+);\d+;\d+([mM])/);
    if (mouse) {
      const code = Number(mouse[1]);
      if (code === 64) keys.push("mouse-up");
      else if (code === 65) keys.push("mouse-down");
      i += mouse[0].length - 1;
    } else if (text.startsWith("\u001b[3~", i)) {
      keys.push("\u001b[3~");
      i += 3;
    } else if (text.startsWith("\u001b[5~", i)) {
      keys.push("\u001b[5~");
      i += 3;
    } else if (text.startsWith("\u001b[6~", i)) {
      keys.push("\u001b[6~");
      i += 3;
    } else if (text.startsWith("\u001b[A", i) || text.startsWith("\u001b[B", i)) {
      keys.push(text.slice(i, i + 3));
      i += 2;
    } else if (text.startsWith("\u001b[H", i) || text.startsWith("\u001b[F", i)) {
      keys.push(text.slice(i, i + 3));
      i += 2;
    } else if (text.startsWith("\u001b[1~", i) || text.startsWith("\u001b[4~", i)) {
      keys.push(text.slice(i, i + 4));
      i += 3;
    } else if (text.startsWith("\u001b[", i)) {
      let end = i + 2;
      while (end < text.length) {
        const code = text.charCodeAt(end);
        if (code >= 0x40 && code <= 0x7e) break;
        end += 1;
      }
      i = end;
    } else if (text[i] === "\u001b") {
      continue;
    } else {
      keys.push(text[i]);
    }
  }
  return keys;
}

async function* walk(dir) {
  let entries = [];
  try {
    entries = await fsp.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(fullPath);
    if (entry.isFile() && entry.name.endsWith(".jsonl")) yield fullPath;
  }
}

function messageContentText(payload) {
  return (payload.content || [])
    .filter((item) => item.type === "input_text" || item.type === "output_text")
    .map((item) => item.text || "")
    .join("\n");
}

async function loadConversationText(rolloutPath) {
  if (!rolloutPath || !fs.existsSync(rolloutPath)) return "";

  const eventMessages = [];
  const fallbackMessages = [];
  const input = fs.createReadStream(rolloutPath, { encoding: "utf8" });
  const lines = readline.createInterface({ input, crlfDelay: Infinity });

  try {
    for await (const line of lines) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        const payload = entry.payload || {};
        if (
          entry.type === "event_msg"
          && (payload.type === "user_message" || payload.type === "agent_message")
        ) {
          if (payload.message) eventMessages.push(payload.message);
        } else if (
          entry.type === "response_item"
          && payload.type === "message"
          && (payload.role === "user" || payload.role === "assistant")
        ) {
          const text = messageContentText(payload);
          if (text) fallbackMessages.push(text);
        }
      } catch {
        // Ignore incomplete or invalid JSONL records and keep the session searchable.
      }
    }
  } catch {
    return "";
  }

  return (eventMessages.length ? eventMessages : fallbackMessages).join("\n").toLowerCase();
}

async function indexConversationText(rows) {
  for (const row of rows) {
    row.conversationText = await loadConversationText(row.rolloutPath);
  }
  return rows;
}

async function findRolloutFiles(sessionId, knownPath) {
  const files = new Set();
  if (knownPath && fs.existsSync(knownPath) && isInside(CODEX_HOME, knownPath)) files.add(knownPath);
  for await (const file of walk(SESSIONS_DIR)) {
    if (path.basename(file).includes(sessionId)) files.add(file);
  }
  return [...files].sort();
}

function isInside(parent, child) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function makeBackup(sessionId, files) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(BACKUP_DIR, `${stamp}-${sessionId}`);
  await fsp.mkdir(dir, { recursive: true });

  if (fs.existsSync(STATE_DB)) {
    await fsp.copyFile(STATE_DB, path.join(dir, "state_5.sqlite"));
  }
  if (fs.existsSync(HISTORY)) {
    await fsp.copyFile(HISTORY, path.join(dir, "history.jsonl"));
  }

  for (const file of files) {
    const rel = path.relative(CODEX_HOME, file);
    const target = path.join(dir, rel);
    await fsp.mkdir(path.dirname(target), { recursive: true });
    await fsp.copyFile(file, target);
  }
  return dir;
}

function trashFiles(files) {
  for (const file of files) {
    const result = spawnSync("gio", ["trash", file], { encoding: "utf8" });
    if (result.status !== 0) {
      const detail = result.stderr || result.stdout || `exit ${result.status}`;
      throw new Error(`Failed to move to trash: ${file}\n${detail.trim()}`);
    }
  }
}

async function cleanupHistory(sessionId) {
  if (!fs.existsSync(HISTORY)) return { before: 0, after: 0 };
  const text = await fsp.readFile(HISTORY, "utf8");
  const lines = text.split("\n");
  const kept = lines.filter((line) => {
    if (!line.trim()) return false;
    try {
      return JSON.parse(line).session_id !== sessionId;
    } catch {
      return true;
    }
  });
  await fsp.writeFile(HISTORY, kept.length ? `${kept.join("\n")}\n` : "", "utf8");
  return { before: lines.filter((line) => line.trim()).length, after: kept.length };
}

function archiveThread(sessionId) {
  const now = Math.floor(Date.now() / 1000);
  const db = openDb(false);
  try {
    db.exec("pragma foreign_keys = on");
    db.prepare("update threads set archived = 1, archived_at = ? where id = ?").run(now, sessionId);
  } finally {
    db.close();
  }
}

async function deleteSession(row, { dryRun = false } = {}) {
  const files = await findRolloutFiles(row.id, row.rolloutPath);
  const historyLines = fs.existsSync(HISTORY)
    ? (await fsp.readFile(HISTORY, "utf8"))
        .split("\n")
        .filter((line) => line.trim())
        .filter((line) => {
          try {
            return JSON.parse(line).session_id === row.id;
          } catch {
            return false;
          }
        }).length
    : 0;

  if (dryRun) {
    return {
      id: row.id,
      title: row.title,
      rolloutFiles: files,
      historyLines,
      willArchiveThread: true,
    };
  }

  await makeBackup(row.id, files);
  trashFiles(files);
  archiveThread(row.id);
  await cleanupHistory(row.id);
  return { files: files.length, historyLines };
}

function printList(rows, { all = false } = {}) {
  for (const row of rows) {
    console.log(
      [
        row.id,
        new Date(row.createdAt * 1000).toISOString(),
        new Date(row.updatedAt * 1000).toISOString(),
        ...(all ? [row.cwd] : []),
        row.branch || "-",
        row.title,
      ].join("\t"),
    );
  }
}

function restoreTerminal() {
  process.stdout.write("\x1b[?25h");
  process.stdout.write("\x1b[?1049l");
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
}

function resume(row) {
  restoreTerminal();
  process.stdin.pause();
  spawnSync("codex", ["resume", row.id], { stdio: "inherit" });
  process.exit(0);
}

async function interactive(scope) {
  state.rows = await indexConversationText(loadThreads(scope));
  applyFilter();

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    printList(state.filtered, scope);
    return;
  }

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdout.write("\x1b[?1049h\x1b[H\x1b[2J\x1b[?25l");
  render(scope);

  const cleanup = () => restoreTerminal();

  process.on("exit", cleanup);
  process.on("SIGINT", () => process.exit(130));
  process.on("SIGWINCH", () => {
    clampOffset();
    render(scope);
  });

  for await (const chunk of process.stdin) {
    for (const key of parseKeys(chunk)) {
      const current = state.filtered[state.selected];

      if (state.searching) {
        if (key === "\r") {
          if (current) resume(current);
          state.searching = false;
        } else if (key === "\u001b") {
          state.searching = false;
          state.query = "";
          state.selected = 0;
          applyFilter();
        } else if (moveSelectionForKey(key, { vimKeys: false })) {
          state.message = "";
        } else if (key === "\u007f" || key === "\b") {
          state.query = state.query.slice(0, -1);
          state.selected = 0;
          applyFilter();
        } else if (key === "\u0003") {
          process.exit(0);
        } else if (key.length === 1 && key >= " ") {
          state.query += key;
          state.selected = 0;
          applyFilter();
        }
        clampOffset();
        render(scope);
        continue;
      }

      if (state.confirmingDelete) {
        if (key.toLowerCase() === "y") {
          const target = state.confirmingDelete;
          state.confirmingDelete = null;
          try {
            const result = await deleteSession(target);
            state.rows = await indexConversationText(
              loadThreads(scope).filter((row) => row.id !== target.id),
            );
            applyFilter();
            state.message = `Deleted ${target.id}: trashed ${result.files} file(s), removed ${result.historyLines} history line(s)`;
          } catch (error) {
            state.message = error.message;
          }
        } else if (key.toLowerCase() === "n" || key === "\r" || key === "\u001b" || key === "q") {
          state.confirmingDelete = null;
          state.message = "Delete cancelled";
        }
        clampOffset();
        render(scope);
        continue;
      }

      if (key === "\u0003" || key === "q") process.exit(0);
      else if (key === "\r" && current) resume(current);
      else if (moveSelectionForKey(key, { vimKeys: true })) {
        state.message = "";
      } else if (key === "\t") {
        state.sort = state.sort === "updated" ? "created" : "updated";
        applyFilter();
      } else if (key === "/") {
        state.searching = true;
        state.message = "";
        state.selected = 0;
        applyFilter();
      } else if ((key === "\u001b[3~" || key === "d") && current) {
        state.confirmingDelete = current;
        state.message = "";
      }

      clampOffset();
      render(scope);
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const scope = { cwd: args.cwd, all: args.all };
  const rows = loadThreads(scope);
  if (args.dryRunDelete) {
    const row = rows.find((item) => item.id === args.dryRunDelete);
    if (!row) {
      const scopeLabel = args.all ? "all folders" : `cwd ${args.cwd}`;
      throw new Error(`No active session for ${scopeLabel}: ${args.dryRunDelete}`);
    }
    console.log(JSON.stringify(await deleteSession(row, { dryRun: true }), null, 2));
    return;
  }

  await interactive(scope);
}

if (
  process.argv[1]
  && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))
) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

export {
  indexConversationText,
  loadConversationText,
  loadThreads,
  messageContentText,
  parseArgs,
  rowMatchesQuery,
  selectedIndexAfterKey,
};
