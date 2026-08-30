import { relativeRedirect } from "@/lib/relativeRedirect";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveImageField } from "@/lib/uploads";
import { applyHeadingAccents } from "@/lib/headingAccents";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const slug = String(form.get("slug") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const excerpt = String(form.get("excerpt") ?? "").trim();
  const body = applyHeadingAccents(String(form.get("body") ?? "").trim());
  const publishedAt = String(form.get("published_at") ?? "").trim();
  const published = form.get("published") ? 1 : 0;
  const category = String(form.get("category") ?? "").trim();
  const author = String(form.get("author") ?? "").trim() || "Andrei Stanescu";
  const tags = String(form.get("tags") ?? "").trim();

  if (!slug || !title || !excerpt) {
    const url = new URL("/admin/insights/new", request.url);
    url.searchParams.set("error", "Slug, title, and excerpt are required.");
    return relativeRedirect(url.pathname + url.search);
  }

  const coverImage = await resolveImageField(form, "cover_image", "");
  const thumbnailImage = await resolveImageField(form, "thumbnail_image", "");

  const maxPosition = db
    .prepare("SELECT COALESCE(MAX(position), -1) AS max FROM insights")
    .get() as { max: number };

  try {
    db.prepare(
      `INSERT INTO insights (slug, title, excerpt, body, cover_image, thumbnail_image, published_at, position, published, category, author, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      slug,
      title,
      excerpt,
      body,
      coverImage,
      thumbnailImage,
      publishedAt || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      maxPosition.max + 1,
      published,
      category,
      author,
      tags
    );
  } catch {
    const url = new URL("/admin/insights/new", request.url);
    url.searchParams.set("error", `An insight with slug "${slug}" already exists.`);
    return relativeRedirect(url.pathname + url.search);
  }

  return relativeRedirect("/admin/insights");
}
