import { NextResponse } from "next/server";
import { deleteAdmin, getCurrentAdmin } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요해요." }, { status: 401 });

  const { id } = await params;
  if (id === admin.id) {
    return NextResponse.json(
      { error: "본인 계정은 삭제할 수 없어요. 다른 운영자 계정으로 로그인해 삭제해주세요." },
      { status: 400 }
    );
  }

  const result = await deleteAdmin(id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
