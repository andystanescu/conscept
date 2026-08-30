import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.prepare("DELETE FROM about_philosophy_items WHERE id = ?").run(id);
  return NextResponse.redirect(new URL("/admin/about-philosophy", request.url), 303);
}
