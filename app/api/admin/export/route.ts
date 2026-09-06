import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { listAllPosts, toCSV } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요해요." }, { status: 401 });

  const posts = await listAllPosts();
  const csv = toCSV(posts);
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="digital-chat-${date}.csv"`,
    },
  });
}
