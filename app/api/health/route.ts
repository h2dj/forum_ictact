import { NextResponse } from "next/server";
import { withDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * 배포 환경(특히 Vercel)에서 DATABASE_URL 설정이 실제로 적용됐는지 눈으로
 * 바로 확인하기 위한 헬스체크. 비밀값은 노출하지 않습니다.
 */
export async function GET() {
  const usingRemote = !!process.env.DATABASE_URL;
  try {
    await withDb();
    return NextResponse.json({
      ok: true,
      database: usingRemote ? "remote(DATABASE_URL)" : "local(file)",
      hasAuthToken: !!process.env.DATABASE_AUTH_TOKEN,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        database: usingRemote ? "remote(DATABASE_URL)" : "local(file)",
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
