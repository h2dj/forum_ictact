"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import { BOARDS, REACTIONS } from "@/lib/boards";
import { ApiPost } from "@/lib/types";
import { useShuffledPosts } from "@/lib/useShuffledPosts";
import { ReactionSortKey, SortMode, sortByPopularity } from "@/lib/sort";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const SORT_OPTIONS: { id: SortMode; emoji: string; label: string }[] = [
  { id: "latest", emoji: "🕒", label: "최신순" },
  { id: "popular", emoji: "🔥", label: "반응순" },
  { id: "random", emoji: "🎲", label: "랜덤" },
];

export default function BoardPage() {
  const [tab, setTab] = useState<string>("all");
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [reactionKey, setReactionKey] = useState<ReactionSortKey>("total");
  const key = `/api/posts?board=${tab}`;
  const { data, isLoading } = useSWR<{ posts: ApiPost[] }>(key, fetcher, {
    refreshInterval: 4000,
    revalidateOnFocus: true,
  });
  const rawPosts = data?.posts ?? [];
  // "랜덤" 모드에서만 20초마다 표시 순서를 무작위로 섞습니다. 다른 모드에서도
  // 훅 자체는 호출하되(Hooks 규칙), 결과는 랜덤 모드일 때만 사용합니다.
  const shuffledPosts = useShuffledPosts(rawPosts);
  const posts =
    sortMode === "random" ? shuffledPosts : sortMode === "popular" ? sortByPopularity(rawPosts, reactionKey) : rawPosts;

  async function handleReact(postId: string, type: string) {
    // optimistic update
    mutate(
      key,
      (prev: { posts: ApiPost[] } | undefined) => {
        if (!prev) return prev;
        return {
          posts: prev.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  reaction_heart: p.reaction_heart + (type === "heart" ? 1 : 0),
                  reaction_idea: p.reaction_idea + (type === "idea" ? 1 : 0),
                  reaction_surprise: p.reaction_surprise + (type === "surprise" ? 1 : 0),
                }
              : p
          ),
        };
      },
      false
    );
    try {
      await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
    } finally {
      mutate(key);
    }
  }

  return (
    <div className="mx-auto min-h-[100dvh] max-w-6xl px-4 pb-28 pt-6 sm:px-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-[20px] font-extrabold text-ink">
            오늘의 디지털 수다 💬
          </Link>
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink/45">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            실시간으로 이야기가 쌓이고 있어요
          </p>
        </div>
        <div className="flex items-center gap-3 text-[12.5px] text-ink/40">
          <Link href="/display" className="hover:text-ink/70">
            큰 화면 보기
          </Link>
          <Link href="/admin" className="hover:text-ink/70">
            운영자
          </Link>
        </div>
      </header>

      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <TabButton active={tab === "all"} onClick={() => setTab("all")} label="전체" />
        {BOARDS.map((b) => (
          <TabButton key={b.id} active={tab === b.id} onClick={() => setTab(b.id)} label={`${b.emoji} ${b.title}`} />
        ))}
      </div>

      <div className="-mx-4 mb-5 flex flex-wrap items-center gap-2 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1.5 rounded-full bg-black/[0.04] p-1">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => setSortMode(o.id)}
              className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition ${
                sortMode === o.id ? "bg-white text-ink shadow-note" : "text-ink/45 hover:text-ink/70"
              }`}
            >
              {o.emoji} {o.label}
            </button>
          ))}
        </div>

        {sortMode === "popular" && (
          <div className="flex items-center gap-1.5 border-l border-black/10 pl-2.5">
            <ReactionKeyButton active={reactionKey === "total"} onClick={() => setReactionKey("total")} label="전체" />
            {REACTIONS.map((r) => (
              <ReactionKeyButton
                key={r.id}
                active={reactionKey === r.id}
                onClick={() => setReactionKey(r.id)}
                label={r.emoji}
                title={r.label}
              />
            ))}
          </div>
        )}
      </div>

      {!isLoading && rawPosts.length === 0 && (
        <div className="mt-16 flex flex-col items-center text-center text-ink/40">
          <span className="text-4xl">📭</span>
          <p className="mt-3 text-[14px]">아직 붙여진 이야기가 없어요.</p>
          <p className="text-[14px]">첫 이야기를 남겨볼까요?</p>
        </div>
      )}

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {posts.map((p, i) => (
          <PostCard key={p.id} post={p} colorIndex={i} showBoardTag={tab === "all"} onReact={handleReact} />
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-brand-50 p-5 text-center text-[13.5px] leading-relaxed text-brand-700">
        다양한 생각이 모여, 더 나은 내일을 만듭니다. 🌱
        <br />
        오늘도 좋은 수다를 나눠주셔서 감사합니다.
      </div>

      <Link
        href="/?step=board"
        className="fixed bottom-6 right-5 flex items-center gap-2 rounded-full bg-ink px-5 py-3.5 text-[14px] font-bold text-white shadow-pop transition active:scale-95 sm:bottom-8 sm:right-8"
      >
        ✏️ 나도 한마디
      </Link>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition ${
        active
          ? "border-ink bg-ink text-white"
          : "border-black/10 bg-white text-ink/55 hover:border-black/20"
      }`}
    >
      {label}
    </button>
  );
}

function ReactionKeyButton({
  active,
  onClick,
  label,
  title,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-full px-2.5 py-1 text-[13px] font-semibold transition ${
        active ? "bg-ink text-white" : "bg-black/[0.04] text-ink/50 hover:bg-black/[0.08]"
      }`}
    >
      {label}
    </button>
  );
}
