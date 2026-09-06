import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { deletePost, getPost, setPostStatus } from "@/lib/db";

const VALID_STATUS = new Set(["published", "pending", "hidden"]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "관리자 로그인이 필요해요." }, { status: 401 });
  const { id } = await params;
  if (!getPost(id)) return NextResponse.json({ error: "글을 찾을 수 없어요." }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  const { status } = (body ?? {}) as Record<string, unknown>;
  if (typeof status !== "string" || !VALID_STATUS.has(status)) {
    return NextResponse.json({ error: "잘못된 상태값이에요." }, { status: 400 });
  }
  setPostStatus(id, status as "published" | "pending" | "hidden");
  return NextResponse.json({ post: getPost(id) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "관리자 로그인이 필요해요." }, { status: 401 });
  const { id } = await params;
  if (!getPost(id)) return NextResponse.json({ error: "글을 찾을 수 없어요." }, { status: 404 });
  deletePost(id);
  return NextResponse.json({ ok: true });
}
