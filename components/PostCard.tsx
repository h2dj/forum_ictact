"use client";

import { useEffect, useRef, useState } from "react";
import { ApiPost } from "@/lib/types";
import { EMOTIONS, REACTIONS, getBoard } from "@/lib/boards";
import { paletteFor } from "@/lib/palette";
import { relativeTimeKo } from "@/lib/time";

// 행사장에서는 태블릿/키오스크 한 대를 여러 사람이 돌아가며 씁니다. 그래서
// 반응은 "한 브라우저당 한 번"으로 잠그지 않고 몇 번이든 누를 수 있게 하되,
// 실수로 같은 탭을 두 번 눌러 중복 집계되는 것만 짧게 막습니다.
const TAP_COOLDOWN_MS = 500;

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
  const [cooldown, setCooldown] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState(0);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    // relative time을 클라이언트에서만 계산해 hydration 불일치를 피함
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, [post.id]);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      Object.values(activeTimers).forEach(clearTimeout);
    };
  }, []);

  function handleReact(type: string) {
    if (cooldown[type]) return;
    setCooldown((prev) => ({ ...prev, [type]: true }));
    onReact?.(post.id, type);
    timers.current[type] = setTimeout(() => {
      setCooldown((prev) => ({ ...prev, [type]: false }));
    }, TAP_COOLDOWN_MS);
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
            disabled={!onReact || cooldown[r.id]}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-medium transition active:scale-95 ${
              cooldown[r.id]
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
