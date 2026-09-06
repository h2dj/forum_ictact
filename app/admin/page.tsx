"use client";

import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import { BOARDS, EMOTIONS, getBoard } from "@/lib/boards";
import { ApiBoard, ApiPost } from "@/lib/types";
import { relativeTimeKo } from "@/lib/time";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_LABEL: Record<string, string> = {
  published: "게시중",
  pending: "승인 대기",
  hidden: "숨김",
};
const STATUS_STYLE: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  hidden: "bg-black/10 text-ink/50",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [boardFilter, setBoardFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/posts")
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
    } else {
      const json = await res.json().catch(() => ({}));
      setLoginError(json.error || "로그인에 실패했어요.");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setPassword("");
  }

  if (authed === null) {
    return <div className="p-10 text-center text-ink/40">불러오는 중...</div>;
  }

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center px-6">
        <h1 className="text-[22px] font-extrabold text-ink">운영자 로그인</h1>
        <p className="mt-1 text-[13.5px] text-ink/45">부적절한 게시물 관리와 승인, 내보내기를 할 수 있어요.</p>
        <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="관리자 비밀번호"
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-[14px] outline-none focus:border-brand-300"
            autoFocus
          />
          {loginError && <p className="text-[13px] text-rose-500">{loginError}</p>}
          <button className="rounded-xl bg-ink px-4 py-3 text-[14px] font-bold text-white">로그인</button>
        </form>
        <Link href="/" className="mt-6 text-center text-[12.5px] text-ink/35 hover:text-ink/60">
          ← 참여 화면으로 돌아가기
        </Link>
      </div>
    );
  }

  return <Dashboard boardFilter={boardFilter} setBoardFilter={setBoardFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onLogout={handleLogout} />;
}

function Dashboard({
  boardFilter,
  setBoardFilter,
  statusFilter,
  setStatusFilter,
  onLogout,
}: {
  boardFilter: string;
  setBoardFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  onLogout: () => void;
}) {
  const postsKey = `/api/admin/posts?board=${boardFilter}&status=${statusFilter}`;
  const { data: postsData } = useSWR<{ posts: ApiPost[]; pending: number }>(postsKey, fetcher, {
    refreshInterval: 5000,
  });
  const { data: boardsData } = useSWR<{ boards: ApiBoard[] }>("/api/boards", fetcher);

  const posts = postsData?.posts ?? [];
  const pendingCount = postsData?.pending ?? 0;

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    mutate(postsKey);
  }

  async function removePost(id: string) {
    if (!confirm("정말 삭제할까요? 되돌릴 수 없어요.")) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    mutate(postsKey);
  }

  async function toggleApproval(boardId: string, next: boolean) {
    await fetch(`/api/admin/boards/${boardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requiresApproval: next }),
    });
    mutate("/api/boards");
    mutate(postsKey);
  }

  return (
    <div className="mx-auto min-h-[100dvh] max-w-4xl px-5 pb-16 pt-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-ink">운영자 페이지</h1>
          <p className="mt-0.5 text-[13px] text-ink/45">
            승인 대기 <span className="font-bold text-amber-600">{pendingCount}</span>건
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/admin/export"
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-semibold text-ink/70 hover:bg-black/[0.03]"
          >
            ⬇ CSV 내보내기
          </a>
          <Link href="/board" className="text-[13px] text-ink/40 hover:text-ink/70">
            게시판
          </Link>
          <button onClick={onLogout} className="text-[13px] text-ink/40 hover:text-ink/70">
            로그아웃
          </button>
        </div>
      </header>

      <section className="mb-6 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-note">
        <h2 className="mb-3 text-[14px] font-bold text-ink/80">보드별 게시 방식</h2>
        <div className="flex flex-col gap-2.5">
          {BOARDS.map((b) => {
            const requiresApproval =
              boardsData?.boards.find((x) => x.id === b.id)?.requiresApproval ?? b.requiresApproval;
            return (
              <label key={b.id} className="flex items-center justify-between gap-3 text-[13.5px] text-ink/70">
                <span>
                  {b.emoji} {b.title}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[12px] text-ink/40">운영자 승인 후 게시</span>
                  <input
                    type="checkbox"
                    checked={requiresApproval}
                    onChange={(e) => toggleApproval(b.id, e.target.checked)}
                    className="h-4 w-4 accent-brand-600"
                  />
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={boardFilter}
          onChange={(e) => setBoardFilter(e.target.value)}
          className="rounded-full border border-black/10 bg-white px-3 py-2 text-[13px]"
        >
          <option value="all">전체 게시판</option>
          {BOARDS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.emoji} {b.title}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-full border border-black/10 bg-white px-3 py-2 text-[13px]"
        >
          <option value="all">전체 상태</option>
          <option value="published">게시중</option>
          <option value="pending">승인 대기</option>
          <option value="hidden">숨김</option>
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {posts.length === 0 && <p className="py-10 text-center text-[13.5px] text-ink/35">글이 없어요.</p>}
        {posts.map((p) => {
          const board = getBoard(p.board_id);
          const emotion = p.emotion_id ? EMOTIONS.find((e) => e.id === p.emotion_id) : undefined;
          return (
            <div key={p.id} className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-note">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
                  <span className="rounded-full bg-black/[0.05] px-2 py-0.5 font-medium text-ink/60">
                    {board ? `${board.emoji} ${board.title}` : p.board_id}
                  </span>
                  {emotion && (
                    <span className="rounded-full bg-black/[0.05] px-2 py-0.5 font-medium text-ink/60">
                      {emotion.emoji} {emotion.label}
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${STATUS_STYLE[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <span className="text-[12px] text-ink/35">{relativeTimeKo(p.created_at)}</span>
              </div>
              <p className="text-[14.5px] leading-relaxed text-ink/90">{p.text}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[12.5px] text-ink/40">
                  {p.nickname || "익명"} · ❤️{p.reaction_heart} 💡{p.reaction_idea} 😮{p.reaction_surprise}
                </span>
                <div className="flex shrink-0 gap-1.5">
                  {p.status === "pending" && (
                    <ActionButton label="승인" onClick={() => updateStatus(p.id, "published")} tone="primary" />
                  )}
                  {p.status !== "hidden" && (
                    <ActionButton label="숨기기" onClick={() => updateStatus(p.id, "hidden")} />
                  )}
                  {p.status === "hidden" && (
                    <ActionButton label="다시 게시" onClick={() => updateStatus(p.id, "published")} tone="primary" />
                  )}
                  <ActionButton label="삭제" onClick={() => removePost(p.id)} tone="danger" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  tone?: "default" | "primary" | "danger";
}) {
  const styles =
    tone === "primary"
      ? "bg-emerald-600 text-white"
      : tone === "danger"
      ? "bg-rose-50 text-rose-600"
      : "bg-black/[0.05] text-ink/60";
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${styles}`}>
      {label}
    </button>
  );
}
