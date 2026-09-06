import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { BOARDS, BoardId } from "./boards";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "forum.db");

// Next.js dev 모드는 모듈을 여러 번 로드할 수 있으므로 전역에 캐싱합니다.
const globalForDb = globalThis as unknown as { __forumDb?: Database.Database };

export const db = globalForDb.__forumDb ?? new Database(DB_PATH);
if (!globalForDb.__forumDb) globalForDb.__forumDb = db;

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL,
    emotion_id TEXT,
    text TEXT NOT NULL,
    nickname TEXT,
    status TEXT NOT NULL DEFAULT 'published',
    created_at INTEGER NOT NULL,
    reaction_heart INTEGER NOT NULL DEFAULT 0,
    reaction_idea INTEGER NOT NULL DEFAULT 0,
    reaction_surprise INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_posts_board ON posts(board_id);
  CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

  CREATE TABLE IF NOT EXISTS board_settings (
    board_id TEXT PRIMARY KEY,
    requires_approval INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    token TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL
  );
`);

// 보드 기본 설정 시드 (없을 때만)
const seedSetting = db.prepare(
  `INSERT OR IGNORE INTO board_settings (board_id, requires_approval) VALUES (?, ?)`
);
const seedTx = db.transaction(() => {
  for (const b of BOARDS) seedSetting.run(b.id, b.requiresApproval ? 1 : 0);
});
seedTx();

export interface PostRow {
  id: string;
  board_id: string;
  emotion_id: string | null;
  text: string;
  nickname: string | null;
  status: "published" | "pending" | "hidden";
  created_at: number;
  reaction_heart: number;
  reaction_idea: number;
  reaction_surprise: number;
}

export function boardRequiresApproval(boardId: string): boolean {
  const row = db
    .prepare(`SELECT requires_approval FROM board_settings WHERE board_id = ?`)
    .get(boardId) as { requires_approval: number } | undefined;
  if (row) return !!row.requires_approval;
  return !!BOARDS.find((b) => b.id === boardId)?.requiresApproval;
}

export function setBoardApproval(boardId: string, requiresApproval: boolean) {
  db.prepare(
    `INSERT INTO board_settings (board_id, requires_approval) VALUES (?, ?)
     ON CONFLICT(board_id) DO UPDATE SET requires_approval = excluded.requires_approval`
  ).run(boardId, requiresApproval ? 1 : 0);
}

export function getBoardSettings(): Record<string, boolean> {
  const rows = db.prepare(`SELECT board_id, requires_approval FROM board_settings`).all() as {
    board_id: string;
    requires_approval: number;
  }[];
  const out: Record<string, boolean> = {};
  for (const r of rows) out[r.board_id] = !!r.requires_approval;
  return out;
}

export function createPost(input: {
  boardId: BoardId | string;
  emotionId: string | null;
  text: string;
  nickname: string | null;
}): PostRow {
  const id = nanoid(10);
  const status = boardRequiresApproval(input.boardId) ? "pending" : "published";
  const created_at = Date.now();
  db.prepare(
    `INSERT INTO posts (id, board_id, emotion_id, text, nickname, status, created_at)
     VALUES (@id, @boardId, @emotionId, @text, @nickname, @status, @created_at)`
  ).run({
    id,
    boardId: input.boardId,
    emotionId: input.emotionId,
    text: input.text,
    nickname: input.nickname,
    status,
    created_at,
  });
  return getPost(id)!;
}

export function getPost(id: string): PostRow | undefined {
  return db.prepare(`SELECT * FROM posts WHERE id = ?`).get(id) as PostRow | undefined;
}

export function listPublicPosts(boardId?: string): PostRow[] {
  if (boardId && boardId !== "all") {
    return db
      .prepare(`SELECT * FROM posts WHERE status = 'published' AND board_id = ? ORDER BY created_at DESC`)
      .all(boardId) as PostRow[];
  }
  return db
    .prepare(`SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC`)
    .all() as PostRow[];
}

export function listAllPosts(filter?: { boardId?: string; status?: string }): PostRow[] {
  const clauses: string[] = [];
  const params: Record<string, string> = {};
  if (filter?.boardId && filter.boardId !== "all") {
    clauses.push("board_id = @boardId");
    params.boardId = filter.boardId;
  }
  if (filter?.status && filter.status !== "all") {
    clauses.push("status = @status");
    params.status = filter.status;
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return db.prepare(`SELECT * FROM posts ${where} ORDER BY created_at DESC`).all(params) as PostRow[];
}

export function countsByBoard(): Record<string, number> {
  const rows = db
    .prepare(`SELECT board_id, COUNT(*) as n FROM posts WHERE status = 'published' GROUP BY board_id`)
    .all() as { board_id: string; n: number }[];
  const out: Record<string, number> = {};
  for (const r of rows) out[r.board_id] = r.n;
  return out;
}

export function pendingCount(): number {
  const row = db.prepare(`SELECT COUNT(*) as n FROM posts WHERE status = 'pending'`).get() as {
    n: number;
  };
  return row.n;
}

const REACTION_COLUMN: Record<string, string> = {
  heart: "reaction_heart",
  idea: "reaction_idea",
  surprise: "reaction_surprise",
};

export function addReaction(postId: string, type: string): PostRow | undefined {
  const col = REACTION_COLUMN[type];
  if (!col) return undefined;
  db.prepare(`UPDATE posts SET ${col} = ${col} + 1 WHERE id = ? AND status = 'published'`).run(postId);
  return getPost(postId);
}

export function setPostStatus(id: string, status: "published" | "pending" | "hidden") {
  db.prepare(`UPDATE posts SET status = ? WHERE id = ?`).run(status, id);
}

export function deletePost(id: string) {
  db.prepare(`DELETE FROM posts WHERE id = ?`).run(id);
}

export function toCSV(rows: PostRow[]): string {
  const header = [
    "id",
    "board_id",
    "emotion_id",
    "nickname",
    "text",
    "status",
    "created_at_iso",
    "heart",
    "idea",
    "surprise",
  ];
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.board_id,
        r.emotion_id ?? "",
        r.nickname ?? "",
        r.text,
        r.status,
        new Date(r.created_at).toISOString(),
        r.reaction_heart,
        r.reaction_idea,
        r.reaction_surprise,
      ]
        .map(escape)
        .join(",")
    );
  }
  return "﻿" + lines.join("\n"); // BOM 포함 → 엑셀에서 한글 깨짐 방지
}
