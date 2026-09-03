import { relativeRedirect } from "@/lib/relativeRedirect";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveImageField } from "@/lib/uploads";
import { applyHeadingAccents } from "@/lib/headingAccents";
import { getSettings } from "@/lib/settings";
import { dateInputValue } from "@/lib/dateUtils";
import { assessmentCriteriaList, getPrimaryComplexityDrivers } from "@/data/caseStudyAssessment";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const slug = String(form.get("slug") ?? "").trim();
  const eyebrow = String(form.get("eyebrow") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();
  const year = String(form.get("year") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const tags = String(form.get("tags") ?? "").trim();
  const metaTitle = String(form.get("meta_title") ?? "").trim();
  const metaDescription = String(form.get("meta_description") ?? "").trim();
  const metaKeywords = String(form.get("meta_keywords") ?? "").trim();
  const canonicalUrl = String(form.get("canonical_url") ?? "").trim();
  const ogImage = String(form.get("og_image") ?? "").trim();
  const noIndex = form.get("no_index") === "on" ? 1 : 0;
  const outcomeEyebrow = String(form.get("outcome_eyebrow") ?? "OUTCOMES").trim();
  const outcomeTitle = String(form.get("outcome_title") ?? "").trim();
  const metrics = JSON.stringify(Array.from({ length: 6 }, (_, i) => ({ value: String(form.get(`metric_${i + 1}_value`) ?? "").trim(), label: String(form.get(`metric_${i + 1}_label`) ?? "").trim() })).filter((metric) => metric.value && metric.label));
  const assessmentScores = Object.fromEntries(assessmentCriteriaList.map((criterion) => [criterion.key, Math.max(0, Math.min(5, Number(form.get(`assessment_score_${criterion.key}`) ?? 0) || 0))]));
  const assessment = JSON.stringify({ scores: assessmentScores, overall: String(form.get("assessment_overall") ?? "").trim(), overallDescription: String(form.get("assessment_overall_description") ?? "").trim(), primaryDrivers: getPrimaryComplexityDrivers(assessmentScores), likelyEngagement: form.getAll("assessment_likely").map(String).filter(Boolean), conducted: form.getAll("assessment_conducted").map(String).filter(Boolean) });
  const passwordRequired = form.get("password_required") === "on" ? 1 : 0;
  let passwordAdditions: Array<{ name: string; password: string }> = [];
  try {
    const parsed = JSON.parse(String(form.get("password_add") ?? "[]"));
    passwordAdditions = Array.isArray(parsed) ? parsed.filter((value): value is { name: string; password: string } => Boolean(value) && typeof value.password === "string" && value.password.trim()).map((value) => ({ name: typeof value.name === "string" && value.name.trim() ? value.name.trim() : "Unnamed guest", password: value.password.trim() })) : [];
  } catch { passwordAdditions = []; }
  const passwordHashes = JSON.stringify(await Promise.all(passwordAdditions.map(async ({ name, password }) => ({ name, hash: await bcrypt.hash(password, 12) }))));
  const body = applyHeadingAccents(String(form.get("body") ?? "").trim());
  const published = form.get("published") ? 1 : 0;
  const author = getSettings().author_name;
  const publishedAt = dateInputValue(String(form.get("published_at") ?? "").trim());

  if (!slug || !title || !description) {
    const url = new URL("/admin/case-studies/new", request.url);
    url.searchParams.set("error", "Slug, title, and description are required.");
    return relativeRedirect(url.pathname + url.search);
  }

  const coverImage = await resolveImageField(form, "cover_image", "");
  const thumbnailImage = await resolveImageField(form, "thumbnail_image", "");

  const maxPosition = db
    .prepare("SELECT COALESCE(MAX(position), -1) AS max FROM case_studies")
    .get() as { max: number };

  try {
    db.prepare(
      `INSERT INTO case_studies (slug, eyebrow, category, year, title, description, tags, body, cover_image, thumbnail_image, outcome_eyebrow, outcome_title, metrics, assessment, password_required, password_hashes, position, published, author, published_at, meta_title, meta_description, meta_keywords, canonical_url, og_image, no_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      slug,
      eyebrow,
      category,
      year,
      title,
      description,
      tags,
      body,
      coverImage,
      thumbnailImage,
      outcomeEyebrow,
      outcomeTitle,
      metrics,
      assessment,
      passwordRequired,
      passwordHashes,
      maxPosition.max + 1,
      published,
      author,
      publishedAt,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogImage,
      noIndex
    );
  } catch {
    const url = new URL("/admin/case-studies/new", request.url);
    url.searchParams.set("error", `A case study with slug "${slug}" already exists.`);
    return relativeRedirect(url.pathname + url.search);
  }

  return relativeRedirect("/admin/case-studies");
}
