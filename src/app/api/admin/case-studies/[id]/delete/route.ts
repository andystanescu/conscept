import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.prepare("DELETE FROM case_studies WHERE id = ?").run(id);
  return NextResponse.redirect(new URL("/admin/case-studies", request.url), 303);
}
