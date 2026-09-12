import { REACTIONS } from "./boards";
import { ApiPost } from "./types";

export type SortMode = "latest" | "popular" | "random";
export type ReactionSortKey = "total" | (typeof REACTIONS)[number]["id"];

export function reactionValue(post: ApiPost, key: ReactionSortKey): number {
  if (key === "heart") return post.reaction_heart;
  if (key === "idea") return post.reaction_idea;
  if (key === "surprise") return post.reaction_surprise;
  return post.reaction_heart + post.reaction_idea + post.reaction_surprise;
}

/** 반응 수가 많은 순서로 정렬합니다. 반응 수가 같으면 최신 글을 앞에 둡니다. */
export function sortByPopularity(posts: ApiPost[], key: ReactionSortKey): ApiPost[] {
  return [...posts].sort((a, b) => reactionValue(b, key) - reactionValue(a, key) || b.created_at - a.created_at);
}
