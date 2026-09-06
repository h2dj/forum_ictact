import { NextResponse } from "next/server";
import { BOARDS } from "@/lib/boards";
import { countsByBoard, getBoardSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const counts = countsByBoard();
  const settings = getBoardSettings();
  const boards = BOARDS.map((b) => ({
    ...b,
    count: counts[b.id] ?? 0,
    requiresApproval: settings[b.id] ?? b.requiresApproval,
  }));
  return NextResponse.json({ boards });
}
