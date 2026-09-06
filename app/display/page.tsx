"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { QRCodeSVG } from "qrcode.react";
import PostCard from "@/components/PostCard";
import { MAIN_BOARDS } from "@/lib/boards";
import { ApiBoard, ApiPost } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DisplayPage() {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const { data: postsData } = useSWR<{ posts: ApiPost[] }>("/api/posts", fetcher, {
    refreshInterval: 5000,
  });
  const { data: boardsData } = useSWR<{ boards: ApiBoard[] }>("/api/boards", fetcher, {
    refreshInterval: 8000,
  });
  const posts = postsData?.posts ?? [];
  const countFor = (id: string) => boardsData?.boards.find((b) => b.id === id)?.count ?? 0;

  return (
    <div className="mx-auto min-h-[100dvh] max-w-[1600px] px-8 pb-14 pt-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-[34px] font-extrabold leading-tight text-ink">오늘의 디지털 수다 💬</h1>
          <p className="mt-1 text-[16px] text-ink/50">여러분의 이야기가 더 나은 변화를 만들어요!</p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-black/[0.06] bg-white px-5 py-4 shadow-note">
          <div className="rounded-xl bg-white p-1.5 shadow-note">
            {origin ? <QRCodeSVG value={origin} size={92} /> : <div className="h-[92px] w-[92px]" />}
          </div>
          <div>
            <p className="text-[15px] font-bold text-ink">지금, 여기서도 참여할 수 있어요!</p>
            <p className="mt-0.5 text-[13px] text-ink/45">QR코드를 스캔해서 30초 만에 참여해보세요.</p>
          </div>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-3">
        {MAIN_BOARDS.map((b) => (
          <span
            key={b.id}
            className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-4 py-2 text-[14px] font-semibold text-ink/70 shadow-note"
          >
            {b.emoji} {b.title}
            <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[12.5px] tabular-nums text-ink/50">
              {countFor(b.id)}
            </span>
          </span>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="mt-24 text-center text-ink/35">
          <p className="text-[18px]">첫 이야기를 기다리고 있어요 🙂</p>
        </div>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} colorIndex={i} showBoardTag />
          ))}
        </div>
      )}

      <div className="mt-10 rounded-2xl bg-brand-50 p-6 text-center text-[15px] leading-relaxed text-brand-700">
        다양한 생각이 모여, 더 나은 내일을 만듭니다. 🌱 오늘도 좋은 수다를 나눠주셔서 감사합니다.
      </div>
    </div>
  );
}
