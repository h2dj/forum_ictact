"use client";

import { useEffect, useState } from "react";
import { ApiPost } from "./types";

/** 항상 같은 글이 맨 위(또는 맨 앞)에 고정되지 않도록 일정 시간마다 섞습니다. */
const DEFAULT_SHUFFLE_INTERVAL_MS = 20000;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 게시글 배열을 받아 최신순 그대로 보여주는 대신, `intervalMs`마다 표시
 * 순서를 무작위로 섞어서 반환합니다. 그 사이 새 글이 올라오면 목록 끝에
 * 바로 추가해 즉시 보이게 하고(다음 셔플 때 자연스럽게 섞임), 반응(하트 등)
 * 갱신처럼 순서를 유지해야 하는 폴링에는 영향을 주지 않습니다.
 */
export function useShuffledPosts(
  posts: ApiPost[],
  intervalMs: number = DEFAULT_SHUFFLE_INTERVAL_MS
): ApiPost[] {
  const [order, setOrder] = useState<string[]>(() => posts.map((p) => p.id));

  // 목록에 추가/삭제된 글만 순서에 반영하고, 남아있는 글의 순서는 그대로 둡니다.
  useEffect(() => {
    setOrder((prev) => {
      const ids = new Set(posts.map((p) => p.id));
      const alive = prev.filter((id) => ids.has(id));
      const aliveSet = new Set(alive);
      const added = posts.filter((p) => !aliveSet.has(p.id)).map((p) => p.id);
      return [...alive, ...added];
    });
  }, [posts]);

  useEffect(() => {
    const timer = setInterval(() => setOrder((prev) => shuffle(prev)), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  const byId = new Map(posts.map((p) => [p.id, p]));
  return order.map((id) => byId.get(id)).filter((p): p is ApiPost => !!p);
}
