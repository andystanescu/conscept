import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.prepare(
    "UPDATE case_studies SET published = CASE WHEN published = 1 THEN 0 ELSE 1 END WHERE id = ?"
  ).run(id);

  return NextResponse.redirect(new URL("/admin/case-studies", request.url), 303);
}
