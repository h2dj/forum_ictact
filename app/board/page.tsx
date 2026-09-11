"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import { BOARDS } from "@/lib/boards";
import { ApiPost } from "@/lib/types";
import { useShuffledPosts } from "@/lib/useShuffledPosts";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function BoardPage() {
  const [tab, setTab] = useState<string>("all");
  const key = `/api/posts?board=${tab}`;
  const { data, isLoading } = useSWR<{ posts: ApiPost[] }>(key, fetcher, {
    refreshInterval: 4000,
    revalidateOnFocus: true,
  });
  const rawPosts = data?.posts ?? [];
  // 항상 같은 글이 맨 위에 고정되지 않도록 20초마다 표시 순서를 무작위로 섞습니다.
  const posts = useShuffledPosts(rawPosts);

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

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <TabButton active={tab === "all"} onClick={() => setTab("all")} label="전체" />
        {BOARDS.map((b) => (
          <TabButton key={b.id} active={tab === b.id} onClick={() => setTab(b.id)} label={`${b.emoji} ${b.title}`} />
        ))}
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
