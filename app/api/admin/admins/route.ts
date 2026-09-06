import { NextRequest, NextResponse } from "next/server";
import { createAdmin, getCurrentAdmin, listAdmins } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요해요." }, { status: 401 });
  const admins = await listAdmins();
  return NextResponse.json({ admins });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요해요." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  const { username, password } = (body ?? {}) as Record<string, unknown>;
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "아이디와 비밀번호를 입력해주세요." }, { status: 400 });
  }

  const result = await createAdmin(username, password, admin.username);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ admin: result });
}
