import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { setBoardApproval } from "@/lib/db";
import { getBoard } from "@/lib/boards";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "관리자 로그인이 필요해요." }, { status: 401 });
  const { id } = await params;
  if (!getBoard(id)) return NextResponse.json({ error: "게시판을 찾을 수 없어요." }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  const { requiresApproval } = (body ?? {}) as Record<string, unknown>;
  if (typeof requiresApproval !== "boolean") {
    return NextResponse.json({ error: "잘못된 값이에요." }, { status: 400 });
  }
  setBoardApproval(id, requiresApproval);
  return NextResponse.json({ ok: true });
}
