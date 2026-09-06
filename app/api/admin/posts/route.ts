import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { listAllPosts, pendingCount } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "관리자 로그인이 필요해요." }, { status: 401 });

  const boardId = req.nextUrl.searchParams.get("board") ?? undefined;
  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const posts = listAllPosts({ boardId, status });
  return NextResponse.json({ posts, pending: pendingCount() });
}
