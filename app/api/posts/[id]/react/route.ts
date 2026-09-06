import { NextRequest, NextResponse } from "next/server";
import { addReaction, getPost } from "@/lib/db";
import { REACTIONS } from "@/lib/boards";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await getPost(id);
  if (!existing || existing.status !== "published") {
    return NextResponse.json({ error: "글을 찾을 수 없어요." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  const { type } = (body ?? {}) as Record<string, unknown>;
  if (typeof type !== "string" || !REACTIONS.find((r) => r.id === type)) {
    return NextResponse.json({ error: "반응을 다시 선택해주세요." }, { status: 400 });
  }

  const post = await addReaction(id, type);
  return NextResponse.json({ post });
}
