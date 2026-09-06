import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, destroySession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (token) destroySession(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
