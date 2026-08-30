import { NextRequest, NextResponse } from "next/server";
import { movePagePosition } from "@/lib/pages";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const form = await request.formData();
  const direction = String(form.get("direction") ?? "");

  if (direction === "up" || direction === "down") {
    movePagePosition(slug, direction);
  }

  return NextResponse.redirect(new URL("/admin/pages", request.url), 303);
}
