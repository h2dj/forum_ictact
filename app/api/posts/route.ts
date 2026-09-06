import { NextRequest, NextResponse } from "next/server";
import { createPost, listPublicPosts, boardRequiresApproval } from "@/lib/db";
import { getBoard, EMOTIONS } from "@/lib/boards";

export const dynamic = "force-dynamic";

const MAX_LEN = 300;
const MAX_NICKNAME = 20;

export async function GET(req: NextRequest) {
  const board = req.nextUrl.searchParams.get("board") ?? undefined;
  const posts = await listPublicPosts(board);
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const { boardId, emotionId, text, nickname } = (body ?? {}) as Record<string, unknown>;

  if (typeof boardId !== "string" || !getBoard(boardId)) {
    return NextResponse.json({ error: "게시판을 다시 선택해주세요." }, { status: 400 });
  }
  if (emotionId !== null && emotionId !== undefined) {
    if (typeof emotionId !== "string" || !EMOTIONS.find((e) => e.id === emotionId)) {
      return NextResponse.json({ error: "감정을 다시 선택해주세요." }, { status: 400 });
    }
  }
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "한마디를 남겨주세요." }, { status: 400 });
  }
  if (text.length > MAX_LEN) {
    return NextResponse.json({ error: `${MAX_LEN}자 이내로 남겨주세요.` }, { status: 400 });
  }
  let nick: string | null = null;
  if (typeof nickname === "string" && nickname.trim()) {
    nick = nickname.trim().slice(0, MAX_NICKNAME);
  }

  const post = await createPost({
    boardId,
    emotionId: (emotionId as string) ?? null,
    text: text.trim(),
    nickname: nick,
  });

  return NextResponse.json({
    post,
    pending: await boardRequiresApproval(boardId),
  });
}
