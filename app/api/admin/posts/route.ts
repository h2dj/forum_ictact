import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { listAllPosts, pendingCount } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요해요." }, { status: 401 });

  const boardId = req.nextUrl.searchParams.get("board") ?? undefined;
  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const [posts, pending] = await Promise.all([listAllPosts({ boardId, status }), pendingCount()]);
  return NextResponse.json({ posts, pending });
}
