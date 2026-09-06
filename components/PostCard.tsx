"use client";

import { useEffect, useState } from "react";
import { ApiPost } from "@/lib/types";
import { EMOTIONS, REACTIONS, getBoard } from "@/lib/boards";
import { paletteFor } from "@/lib/palette";
import { relativeTimeKo } from "@/lib/time";

function reactedKey(postId: string, type: string) {
  return `reacted:${postId}:${type}`;
}

export default function PostCard({
  post,
  colorIndex,
  showBoardTag = true,
  onReact,
}: {
  post: ApiPost;
  colorIndex: number;
  showBoardTag?: boolean;
  onReact?: (postId: string, type: string) => void;
}) {
  const palette = paletteFor(colorIndex);
  const emotion = post.emotion_id ? EMOTIONS.find((e) => e.id === post.emotion_id) : undefined;
  const board = getBoard(post.board_id);
  const [reacted, setReacted] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState(0);

  useEffect(() => {
    // relative time을 클라이언트에서만 계산해 hydration 불일치를 피함
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30000);
    const map: Record<string, boolean> = {};
    try {
      for (const r of REACTIONS) {
        if (localStorage.getItem(reactedKey(post.id, r.id))) map[r.id] = true;
      }
    } catch {
      /* 로컬 저장소를 쓸 수 없어도 카드는 정상 표시되어야 함 */
    }
    setReacted(map);
    return () => clearInterval(t);
  }, [post.id]);

  function handleReact(type: string) {
    if (reacted[type]) return;
    setReacted((prev) => ({ ...prev, [type]: true }));
    try {
      localStorage.setItem(reactedKey(post.id, type), "1");
    } catch {
      /* noop */
    }
    onReact?.(post.id, type);
  }

  const counts: Record<string, number> = {
    heart: post.reaction_heart,
    idea: post.reaction_idea,
    surprise: post.reaction_surprise,
  };

  return (
    <div
      className={`animate-pop-in break-inside-avoid rounded-2xl border ${palette.border} ${palette.bg} p-4 shadow-note mb-4`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className={`truncate text-[13px] font-semibold ${palette.text}`}>
          {post.nickname || "이름 없는 참여자"}
        </span>
        <span className="shrink-0 text-[11px] text-ink/35">{now ? relativeTimeKo(post.created_at) : ""}</span>
      </div>

      {(showBoardTag || emotion) && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {showBoardTag && board && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${palette.chip}`}>
              {board.emoji} {board.title}
            </span>
          )}
          {emotion && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-ink/55">
              {emotion.emoji} {emotion.label}
            </span>
          )}
        </div>
      )}

      <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink/90">{post.text}</p>

      <div className="mt-3 flex items-center gap-1.5">
        {REACTIONS.map((r) => (
          <button
            key={r.id}
            onClick={() => handleReact(r.id)}
            disabled={!onReact}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-medium transition active:scale-95 ${
              reacted[r.id]
                ? "border-transparent bg-ink text-white"
                : "border-black/10 bg-white/70 text-ink/60 hover:bg-white"
            } ${!onReact ? "cursor-default opacity-90" : ""}`}
            title={r.label}
          >
            <span>{r.emoji}</span>
            <span className="tabular-nums">{counts[r.id]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
