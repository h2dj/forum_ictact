import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요해요." }, { status: 401 });
  return NextResponse.json({ admin });
}
